import { Component, JSX, splitProps } from "solid-js";

type IconName =
	| "settings-cog"
	| "no-vote"
	| "save"
	| "caret-down"
	| "refresh"
	| "github";

interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	name: IconName;
	boxSize?: JSX.SvgSVGAttributes<SVGSVGElement>["width"];
}

const Icon: Component<IconProps> = (props) => {
	const [customProps, svgProps] = splitProps(props, ["name", "boxSize"]);

	return (
		<svg width={customProps.boxSize} height={customProps.boxSize} {...svgProps}>
			<use href={`/icons/sprite.svg#${customProps.name}`}></use>
		</svg>
	);
};

export default Icon;
