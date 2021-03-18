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
import england from './charts/england';

import london from './charts/london';
import east from './charts/east';
import northEast from './charts/north-east';
import northWest from './charts/north-west';
import southEast from './charts/south-east';
import southWest from './charts/south-west';
import westMidlands from './charts/west-midlands';
import eastMidlands from './charts/east-midlands';
import yorkshire from './charts/yorkshire';

const regions = {'London': london,
                  'England': england,
                  'East of England': east,
                  'North East': northEast,
                  'North West': northWest,
                  'Yorkshire and The Humber': yorkshire,
                  'South East': southEast,
                  'South West': southWest,
                  'East Midlands': eastMidlands,
                  'West Midlands': westMidlands
                  }

var height = 550,
   width = 450,
    active = d3.select(null);

const margin = {left: 50, top: 50, bottom: 50, right: 50};
const plotWidth = width + margin.left + margin.right;
const plotHeight = height + margin.top + margin.bottom;

const data_file = 'data/la_hpearn_ratio.csv'
const la_geojson_file = 'data/eng_la.json'
const regions_centroids_file = 'data/eng_regions_centroids.csv'

var legendText = ["", "", "", "", "", ""];
var legendColors = d3.schemeBlues[8]

Promise.all([
    d3.csv(data_file),
    d3.json(la_geojson_file),
    d3.csv(regions_centroids_file)
]).then((results) => {
    const [data, engLA, centroids] = results;
    myVis(data, engLA, centroids)
});

vegaEmbed('#line-chart', england);

function myVis(data, eng, centroids) {

  var centroids = groupBy(centroids, 'id')
  console.log(centroids)

  var dataByLA = groupBy(data, 'local_authority_code')
 
  function getDataLAYear(data) {
    var ob = {}
    for (const [key, value] of Object.entries(data)) {
      ob[key] = groupBy(data[key], 'year')
  } return ob}

  var databyLAYear = getDataLAYear(dataByLA)

  var databyRegion = groupBy(data, 'region_name')
  console.log(databyRegion)

  var regionNames = ['England', 'London', 'East of England', 'North East','North West', 'Yorkshire and The Humber','South East', 'South West', 'East Midlands', 'West Midlands']
  var geo = 'England'

  var dropdown = d3.select(".drop-down");

  var globalYear = 2019;

  dropdown
    .append("select")
    .selectAll("option")
    .data(regionNames)
    .enter().append("option")
    .attr("value", (d) => {return d;})
    .text((d) => {return d;});

  var slider = d3.select('.slider')
      .append("input")
      .attr("type", "range")
      .attr("min", 1999)
      .attr("max", 2019)
      .attr("step", 1)
      .on("input", function() {
        console.log(dropdown.value)
        var year = this.value
        slider.property("value", year)
        d3.select('.year').text(year);
        globalYear = year;
        renderMap(geo, globalYear)
      });


    //     function change(year){
    //      slider.property("value", year);
    //      d3.select('.year').text(year);
    //      globalYear = year;
    //      svg.selectAll("path")
    //     .style("fill", function(d) {
    //     return color(databyLAYear[d.properties['lad19cd']][year][0]['ratio'])})
    // };

    // var slider = d3.select('.slider')
    //   .append("input")
    //   .attr("type", "range")
    //   .attr("min", 1999)
    //   .attr("max", 2019)
    //   .attr("step", 1)
    //   .on("input", function() {
    //     var year = this.value;
    //     change(year);
    //   });

  dropdown
    .on("change", function (event) {
      geo = event.target.value
      console.log(geo, globalYear);
      renderMap(geo, globalYear)
      console.log(globalYear)
      renderLineChart(geo)
    });

  const features = eng.features

  console.log(features)

  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  var color = d3.scaleQuantize([0, 20], d3.schemeBlues[8])

  const svg = d3.select('#map')
    .append('svg')
    .attr('height', plotHeight)
    .attr('width', plotWidth)
    .append("g");


  svg.append("rect").attr('width', plotWidth).attr('height', plotHeight)
      .style('stroke', 'black').style('fill', 'none');


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


  function renderLineChart(geoArea, year) {
    vegaEmbed('#line-chart', regions[geoArea])
  }


  function renderMap(geoArea, year) {
    console.log(geoArea,year )
    if (geoArea == 'England' | (geoArea == null)) {

      data = eng.features
      var center = d3.geoCentroid(eng)
      var scale  = 150;
      var offset = [plotWidth/2, plotHeight/2];
      var projection = d3.geoMercator().scale(scale).center(center)
          .translate(offset);  

      var path = d3.geoPath().projection(projection);

      var bounds  = path.bounds(eng);
      var hscale  = scale*plotWidth  / (bounds[1][0] - bounds[0][0]);
      var vscale  = scale*plotHeight / (bounds[1][1] - bounds[0][1]);
      var scale   = (hscale < vscale) ? hscale : vscale;
      var offset  = [plotWidth + 23 - (bounds[0][0] + bounds[1][0])/2,
                       plotHeight + 42 -(bounds[0][1] + bounds[1][1])/2];

        // new projection
      projection = d3.geoMercator().center(center)
        .scale(scale).translate(offset);

      path = path.projection(projection);}
    else {
      var data = eng.features.filter(function(d) {return d.properties.region_name == geoArea; })
      console.log(data)

      // var center = centroids[data[0].properties.region_code][0]['centroid']
      var center = [-0.1110575105808903, 51.50059566483052]
      console.log(center)

      var scale  = 7000;
      var offset = [plotWidth/2, plotHeight/2];
      var projection = d3.geoMercator().scale(scale).center(center)
          .translate(offset);  

      var path = d3.geoPath().projection(projection);

    }
    
      d3.selectAll(".local_authority").remove();
      
      var mapShapes = svg.selectAll(".local_authority") 
        .data(data) 
         .join(
          enter =>
            enter
              .append('path')
              .attr('d', x => {
                return path(x)}),
      )       .attr("class", "local_authority")

        .style("stroke-width", "0.5")
        .style("stroke", "white")
        .style("fill", function(d) {
        return color(databyLAYear[d.properties['lad19cd']][year][0]['ratio'])})

      mapShapes
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

  }
    renderMap('England', 2019);

};
