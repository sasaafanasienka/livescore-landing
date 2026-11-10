import React from "react";

interface SectionTitleProps {
	children: React.ReactElement<{ className?: string }>;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
	return React.cloneElement(children, {
		className: [
			children.props.className,
			"font-heading text-[2.8125rem] lg:text-5xl font-bold",
		]
			.filter(Boolean)
			.join(" "),
	});
};

export default SectionTitle;
