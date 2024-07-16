import { normal_cdf, normal_pdf } from "./math";

export let optionAttributes = [
    {title: "Delta", func: "delta"},
    {title: "Gamma", func: "gamma"},
    {title: "Vega", func: "vega"},
    {title: "Theta", func: "theta"},
    {title: "Rho", func: "rho"}
];

export class Asset {
    constructor(underlying_price, notional) {
        this.underlying_price = underlying_price;
        this.notional = notional;
    }

    delta_per_unit(sigma) {
        return 1;
    }

    gamma_per_unit(sigma) {
        return 0;
    }

    vega_per_unit(sigma) {
        return 0;
    }

    theta_per_unit(sigma) {
        return 0;
    }

    rho_per_unit(sigma) {
        return 0;
    }

    delta(sigma) {
        return this.delta_per_unit(sigma) * this.notional;
    }

    gamma(sigma) {
        return this.gamma_per_unit(sigma) * this.notional;
    }

    vega(sigma) {
        return this.vega_per_unit(sigma) * this.notional;
    }

    theta(sigma) {
        return this.theta_per_unit(sigma) * this.notional;
    }

    rho(sigma) {
        return this.rho_per_unit(sigma) * this.notional;
    }
}

export class EuropeanOption extends Asset {
    constructor(option_type, option_price, underlying_price, strike, ttm, r, q, notional) {
        super(underlying_price, notional);
        this.option_type = option_type[0].toUpperCase();
        this.option_price = option_price;
        this.strike = strike;
        this.ttm = ttm;
        this.r = r;
        this.q = q;
    }

    d1(sigma) {
        return (Math.log(this.underlying_price / this.strike) +
            (this.r - this.q + sigma ** 2 / 2) * this.ttm) / (sigma * Math.sqrt(this.ttm)) ;
    }

    d2(sigma) {
        return (Math.log(this.underlying_price / this.strike) +
            (this.r - this.q - sigma ** 2 / 2) * this.ttm) / (sigma * Math.sqrt(this.ttm));
    }

    delta_per_unit(sigma) {
        if (this.option_type === "C") {
            return normal_cdf(this.d1(sigma)) * Math.exp(-this.q * this.ttm);
        } else if (this.option_type === "P") {
            return -normal_cdf(-this.d1(sigma)) * Math.exp(-this.q * this.ttm);
        } else {
            alert("Wrong option type");
        }
    }

    gamma_per_unit(sigma) {
        return (normal_pdf(this.d1(sigma)) * Math.exp(-this.q * this.ttm) /
            (this.underlying_price * sigma * Math.sqrt(this.ttm)));
    }

    vega_per_unit(sigma) {
        return this.underlying_price * Math.sqrt(this.ttm) *
            normal_pdf(this.d1(sigma)) * Math.exp(-this.q * this.ttm);
    }

    theta_per_unit(sigma) {
        if (this.option_type === "C") {
            return -(this.underlying_price * Math.exp(-this.q * this.ttm) * sigma * normal_pdf(this.d1(sigma)) / (2 * Math.sqrt(this.ttm))
                - this.q * this.underlying_price * normal_cdf(this.d1(sigma)) * Math.exp(-this.q * this.ttm)
                + this.r * this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(this.d2(sigma)));
        } else if (this.option_type === "P") {
            return -(this.underlying_price * Math.exp(-this.q * this.ttm) * sigma * normal_pdf(this.d1(sigma)) / (2 * Math.sqrt(this.ttm))
                + this.q * this.underlying_price * normal_cdf(-this.d1(sigma)) * Math.exp(-this.q * this.ttm) +
                - this.r * this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(-this.d2(sigma)));
        } else {
            alert("Wrong option type");
        }
    }

    rho_per_unit(sigma) {
        if (this.option_type === "C") {
            return this.ttm * this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(this.d2(sigma));
        } else if (this.option_type === "P") {
            return -this.ttm * this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(-this.d2(sigma));
        } else {
            alert("Wrong option type");
        }
    }

    theoretical_option_price(sigma) {
        if (this.option_type === "C") {
            return (this.underlying_price * normal_cdf(this.d1(sigma)) * Math.exp(-this.q * this.ttm) -
                this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(this.d2(sigma)));
        } else if (this.option_type === "P") {
            return (-this.underlying_price * normal_cdf(-this.d1(sigma)) * Math.exp(-this.q * this.ttm) +
                this.strike * Math.exp(-this.ttm * this.r) * normal_cdf(-this.d2(sigma)));
        } else {
            alert("Wrong option type");
        }
    }

    diff_with_theo(sigma) {
        return this.theoretical_option_price(sigma) - this.option_price;
    }

    brent(lowerBound, upperBound, tolerance, maxIterations) {
        let a = lowerBound;
        let b = upperBound;
        let fa = this.diff_with_theo(a);
        let fb = this.diff_with_theo(b);

        if (fa * fb > 0) {
            // Root is not bracketed.
            // throw new Error(`Root is not bracketed: [${fa}, ${fb}].`);
            console.log(`Root is not bracketed: [${fa}, ${fb}].`);
            if (Math.abs(fa) < Math.abs(fb)) {
                return a;
            } else {
                return b;
            }
        }

        if (Math.abs(fa) < Math.abs(fb)) {
            [a, b] = [b, a];
            [fa, fb] = [fb, fa];
        }

        let c = a;
        let fc = fa;
        let s = 0;
        let d = 0;
        let mflag = true;
        for (let i = 0; i < maxIterations; i++) {
            // Check if we have succeeded...
            if (fb === 0 || Math.abs(b - a) <= tolerance) {
                // Root found!
                return b;
            }

            // Try to use fast/less-reliable methods first...
            if (fa !== fc && fb !== fc) {
                // Inverse quadratic interpolation.
                s =
                    (a * fb * fc) / ((fa - fb) * (fa - fc)) +
                    (b * fa * fc) / ((fb - fa) * (fb - fc)) +
                    (c * fa * fb) / ((fc - fa) * (fc - fb));
            } else {
                // Secant method.
                s = b - fb * ((b - a) / (fb - fa));
            }

            // If necessary, fallback to slow/more-reliable method...
            if (
                (s - (3 * a + b) / 4) * (s - b) >= 0 ||
                (mflag && Math.abs(s - b) >= Math.abs(b - c) / 2) ||
                (!mflag && Math.abs(s - b) >= Math.abs(c - d) / 2) ||
                (mflag && Math.abs(b - c) < Math.abs(tolerance)) ||
                (!mflag && Math.abs(c - d) < Math.abs(tolerance))
            ) {
                // Bisection method.
                s = (a + b) / 2;
                mflag = true;
            } else {
                mflag = false;
            }

            d = c;
            c = b;
            fc = fb;

            const fs = this.diff_with_theo(s);
            if (fa * fs < 0) {
                b = s;
                fb = fs;
            } else {
                a = s;
                fa = fs;
            }

            if (Math.abs(fa) < Math.abs(fb)) {
                [a, b] = [b, a];
                [fa, fb] = [fb, fa];
            }
        }

        // Could not achieve required tolerance within iteration limit.
        // throw new Error(
        //     'Could not achieve required tolerance within iteration limit.'
        // );
        console.log('Could not achieve required tolerance within iteration limit.')
        return b;
    }

    implied_volatility() {
        return this.brent(0, 5, 1e-9, 10000);
    }
}
