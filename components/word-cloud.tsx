import { FC, useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  words: { name: string; value: number }[];
}

export const WordCloud: FC<Props> = ({ words }) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = draw(words);

    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(node);
    }
  });

  return <div ref={ref}></div>;
};

function draw(words): void {
  const height = 300;
  const width = 300;

  const format = d3.format(",d");
  const color = d3.scaleOrdinal(
    words.map((d) => d.name),
    d3.schemeCategory10,
  );

  const pack = (data) =>
    d3
      .pack()
      .size([width - 2, height - 2])
      .padding(3)(d3.hierarchy({ children: data }).sum((d) => d.value));

  const root = pack(words);

  // Define the div for the tooltip

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .attr("text-anchor", "middle");

  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "fixed")
    .style("padding-left", "16px")
    .style("top", 0 + "px")
    .style("left", 0 + "px");

  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", (d) => `translate(${d.x + 1},${d.y + 1})`);

  leaf
    .append("circle")
    .attr("id", (d) => (d.leafUid = uid("leaf")))
    .attr("r", (d) => d.r)
    .attr("fill-opacity", 0.7)
    .attr("fill", (d) => color(d.data.name))
    .on("mouseover", (e, d) => {
      div.transition().duration(200).style("opacity", 0.9);
      div.html(`<h1>${d.data.name} - ${d.data.value}</h1>`);
    })
    .on("mouseout", () => {
      div.transition().duration(500).style("opacity", 0);
    });

  leaf
    .append("clipPath")
    .attr("id", (d) => (d.clipUid = uid("clip")))
    .append("use")
    .attr("xlink:href", (d) => d.leafUid.href);

  /*
  leaf
    .append("text")
    .attr("clip-path", (d) => d.clipUid)
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    .text((d) => d);
    */

  leaf
    .append("title")
    .text(
      (d) =>
        `${d.data.name === undefined ? "" : d.data.name} - ${format(d.value)}`,
    );

  return svg.node();
}

let idCounter = 0;

function uid(prefix): string {
  idCounter++;
  return prefix + idCounter;
}
