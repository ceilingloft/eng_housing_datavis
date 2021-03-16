// if the data you are going to import is small, then you can import it using es6 import
// (I like to use use screaming snake case for imported json)
// import MY_DATA from './app/data/example.json'

import {groupBy} from './utils';
import * as d3 from 'd3';
import * as topojson from "topojson-client";
import {tile} from 'd3-tile';
import {nest} from 'd3-collection';
import vegaEmbed from 'vega-embed';
// this command imports the css file, if you remove it your css wont be applied!
import './main.css';
import LineChart from './line-chart';

var height = 550,
   width = 450,
    active = d3.select(null);

const margin = {left: 50, top: 50, bottom: 50, right: 50};
const plotWidth = width + margin.left + margin.right;
const plotHeight = height + margin.top + margin.bottom;

const data_file = 'data/la_hpearn_ratio.csv'
const la_geojson_file = 'data/eng_la.json'
const regions_geojson_file = 'data/eng_regions_topo.json'

var legendText = ["", "", "", "", "", ""];
var legendColors = d3.schemeBlues[8]


vegaEmbed('#line-chart', LineChart);

Promise.all([
    d3.csv(data_file),
    d3.json(la_geojson_file),
    d3.json(regions_geojson_file)
]).then((results) => {
    const [data, engLA, regions] = results;
    myVis(data, engLA, regions)
});

function myVis(data, eng, regions) {

var dataByLA = groupBy(data, 'local_authority_code')

console.log(regions)
console.log(eng)

console.log(dataByLA);
 
function getDataLAYear(data) {
  var ob = {}
  for (const [key, value] of Object.entries(data)) {
    ob[key] = groupBy(data[key], 'year')
} return ob}

var databyLAYear = getDataLAYear(dataByLA)

  console.log(databyLAYear['E06000001'][2019][0]);

  var center = d3.geoCentroid(eng)
  var scale  = 150;
  var offset = [plotWidth/2, plotHeight/2];
  var projection = d3.geoMercator().scale(scale).center(center)
          .translate(offset);  

  var path = d3.geoPath().projection(projection);

  const features = eng.features

  console.log(features)

  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  var bounds  = path.bounds(eng);
  var hscale  = scale*plotWidth  / (bounds[1][0] - bounds[0][0]);
  var vscale  = scale*plotHeight / (bounds[1][1] - bounds[0][1]);
  var scale   = (hscale < vscale) ? hscale : vscale;
  var offset  = [plotWidth + 23 - (bounds[0][0] + bounds[1][0])/2,
                     plotHeight + 42 -(bounds[0][1] + bounds[1][1])/2];

      // new projection
  projection = d3.geoMercator().center(center)
    .scale(scale).translate(offset);
  path = path.projection(projection);

  var color = d3.scaleQuantize([0, 20], d3.schemeBlues[8])

  console.log(dataByLA['E06000001'][0]['ratio'])

  const svg = d3.select('#map')
    .append('svg')
    .attr('height', plotHeight)
    .attr('width', plotWidth)
    .append("g");


  svg.append("rect").attr('width', plotWidth).attr('height', plotHeight)
      .style('stroke', 'black').style('fill', 'none').on("click", reset);

  var engShapes = svg.selectAll(".local_authorty") 
    .data(features) 
    .attr("id", "local_authority")
    .enter().append("path") 
    .attr("d", path)
    .style("stroke-width", "0.5")
    .style("stroke", "white")
    .on("click", clicked);


  // var engRegions = svg.append("path")
  //     .datum(topojson.feature(regions, regions.objects.eng_regions, function(a, b) { return a !== b; })) 
  //     .attr("d", path(topojson.mesh(regions, regions.objects.eng_regions, (a, b) => a !== b)))
  //     .style("stroke-width", "2")
  //     .style("stroke", "white")
  //     .style("fill", "transparent");

  var centroids = {}
  topojson.feature(regions, regions.objects.eng_regions).features.map(function (feature){
    centroids[feature.id]  = path.centroid(feature);
    });

  console.log(centroids)

  function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d.originalTarget.__data__),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));

  engShapes.transition()
      .duration(750)
      .attr("transform", "translate(" + plotWidth / 2 + "," + plotHeight / 2 + ")scale(" + scale + ")translate(" + -x + "," + -y  + ")")
      .style("stroke-width", 1.5 / scale + "px");
}


function reset() {
  active.classed("active", false);
  active = d3.select(null);

  engShapes.transition()
      .duration(750)
      .attr("transform", d3.zoomIdentity)
      .style("stroke-width", 2)
}

  var legend = svg.append("g")
    .attr("id", "legend");

  var legenditem = legend.selectAll(".legenditem")
    .data(d3.range(9))
    .enter()
    .append("g")
      .attr("class", "legenditem")
      .attr("transform", function(d, i) { return "translate(" + i * 20 + ",0)"; });

  legenditem.append("rect")
    .attr("x", width - 100)
    .attr("y", 24)
    .attr("width", 20)
    .attr("height", 6)
    .attr("class", "rect")
    .style("fill", function(d, i) { return legendColors[i]; });

  legenditem.append("text")
    .attr("x", width - 100)
    .attr("y", 18)
    .style("text-anchor", "middle")
    .text(function(d, i) { return legendText[i]; });

  let globalYear = 2019;

  function update(year){
    slider.property("value", year);
    d3.select('.year').text(year);
    globalYear = year;
    engShapes.style("fill", function(d) {
      return color(databyLAYear[d.properties['lad19cd']][year][0]['ratio'])
    });
    }

  var slider = d3.select('.slider')
    .append("input")
      .attr("type", "range")
      .attr("min", 1999)
      .attr("max", 2019)
      .attr("step", 1)
      .on("input", function() {
        var year = this.value;
        update(year);
      });

  update(2019);

  engShapes
    .on("mouseover", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 1)
      d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "black")
      tooltip.html(
      "<p><strong>" + databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]["local_authority_name"] + ", " + databyLAYear[d.target.__data__.properties.lad19cd][2019][0]["region_name"] + ' (' + globalYear + ')' +  "</strong></p>" +
       "<table><tbody><tr><td class='wide'>Ratio: </td><td>" + databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]['ratio'] + "</td></tr>" +
       "<tr><td>Median house price: </td><td>" + " £" + parseInt(databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]['median_house_price'], 10) + "</td></tr>" +
       "<tr><td>Median earnings: </td><td>" + " £" + parseInt(databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]['median_earnings'], 10) + "</td></tr></tbody></table>"
      )
      .style("left", (d.pageX + 15) + "px")     
      .style("top", d.pageY + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 0)
        d3.select(this)
      .transition()
      .duration(200)
      .style("stroke-width", "0.5")
      .style("stroke", "white");
    });

};



