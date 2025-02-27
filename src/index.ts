import type {
	LengthValue,
	Function as LightningCssFunction,
	TokenOrValue,
} from "lightningcss";

export interface Config {
	minViewPort: number;
	maxViewPort: number;
	baseFontSize: number;
	unit: "vi" | "vw" | "cqw" | "cqi";
}

export default (opts?: Partial<Config>) => ({
	FunctionExit: {
		fluid(f: LightningCssFunction) {
			const defaultOptions: Config = {
				minViewPort: 375,
				maxViewPort: 1920,
				baseFontSize: 16,
				unit: "vi",
			};

			const options = Object.assign(defaultOptions, opts);

			let isFormulaOuput = false;

			const getRem = (px: number) => {
				return `${px / options.baseFontSize}rem`;
			};

			const getPx = (value: LengthValue) => {
				if (value.unit === "rem") {
					return value.value * options.baseFontSize;
				}

				return value.value;
			};

			const setPxValues = (values: TokenOrValue[]) => {
				return values.map((value) => {
					if (value.type === "length") {
						return getPx(value.value);
					}
				});
			};

			const setFormulaValues = (values: TokenOrValue[]) => {
				return values.map((value) => {
					if (value.type === "length") {
						return value.value.unit === "px"
							? getRem(value.value.value)
							: `${value.value.value}${value.value.unit}`;
					}

					if (value.type === "var") {
						return `var(${value.value.name.ident})`;
					}
				});
			};

			// tokenを削除
			const filteredArguments = f.arguments.filter(
				(val) => val.type !== "token",
			);

			if (filteredArguments.some((val) => val.type !== "length")) {
				// Length以外がある場合
				isFormulaOuput = true;
			}

			if (!isFormulaOuput) {
				const [minSize, maxSize, setMinViewPort, setMaxViewPort] =
					setPxValues(filteredArguments);

				const minViewPort = setMinViewPort || options.minViewPort;
				const maxViewPort = setMaxViewPort || options.maxViewPort;

				if (minSize && maxSize) {
					const valiablePart =
						(maxSize - minSize) / (maxViewPort - minViewPort);
					const constant = maxSize - maxViewPort * valiablePart;

					return {
						raw: `clamp(${getRem(minSize)}, ${getRem(constant)} + ${100 * valiablePart}${options.unit}, ${getRem(maxSize)})`,
					};
				}
			}

			const [minSize, maxSize, setMinViewPort, setMaxViewPort] =
				setFormulaValues(filteredArguments);

			const minViewPort = setMinViewPort || options.minViewPort;
			const maxViewPort = setMaxViewPort || options.maxViewPort;

			const toRem = `(1rem / ${options.baseFontSize})`;
			const min = `(${minSize} * ${toRem})`;
			const max = `(${maxSize} * ${toRem})`;
			const valiablePart = `((${maxSize} - ${minSize}) / (${maxViewPort} - ${minViewPort}))`;
			const constant = `(${minSize} - ${valiablePart} * ${minViewPort} )`;
			const valiable = `((${constant} * ${toRem}) + ( ${valiablePart} * 100${options.unit}))`;

			return {
				raw: `clamp(${min}, ${valiable}, ${max})`,
			};
		},
	},
});
