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

const regionLineCharts = {'London': london,
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

var height = 600,
   width = 480,
    active = d3.select(null);

const margin = {left: 50, top: 50, bottom: 50, right: 50};
const plotWidth = width + margin.left + margin.right;
const plotHeight = height + margin.top + margin.bottom;

const data_file = './data/la_hpearn_ratio.csv'
const la_geojson_file = './data/eng_la.json'
const eng_regions_topo = './data/eng_regions_topo.json'

// var legendText = ["", "2%", "5", "8", "11", "14", "17", "20"];
// var legendColors = d3.schemeBlues[9]

Promise.all([
    d3.csv(data_file),
    d3.json(la_geojson_file),
    d3.json(eng_regions_topo)
]).then((results) => {
    const [data, engLA, regions] = results;
    myVis(data, engLA, regions)
});

var centroids = {
        "E12000001":[-1.905416023775942, 55.01996537696989],
        "E12000002":[-2.723198763300704, 54.0565405820666],
        "E12000003":[-1.229684349202576, 53.96550689063676],
        "E12000004":[-0.8056317083673057, 52.92687321130552],
        "E12000005":[-2.270822281605636, 52.48031635147623],
        "E12000006":[0.5391120229726339, 52.25112720430162],
        "E12000007":[-0.1110575105808903, 51.50059566483052],
        "E12000008":[-0.5339793185931326, 51.28108300426047],
        "E12000009":[-3.130347375749214, 51.00133721589011]}

vegaEmbed('#line-chart', england);

function myVis(data, eng, regions) {

  var dataByLA = groupBy(data, 'local_authority_code')
 
  function getDataLAYear(data) {
    var ob = {}
    for (const [key, value] of Object.entries(data)) {
      ob[key] = groupBy(data[key], 'year')
  } return ob}

  var databyLAYear = getDataLAYear(dataByLA)

  var databyRegion = groupBy(data, 'region_name')

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
      .property("value", globalYear)
      .text(globalYear)
      .on("input", function() {
        globalYear = this.value;
        renderMap(geo, globalYear)
      });

  dropdown
    .on("change", function (event) {
      geo = event.target.value
      renderMap(geo, globalYear)
      renderLineChart(geo)
    });

  const features = eng.features

  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// var x = d3.scaleLinear()
//     .domain([2, 20])
//     .rangeRound([100, 800]);

//   var color = d3.scaleThreshold()
//     .domain(d3.range(2, 20))
//     .range(d3.schemeBlues[9]);

  // var color = d3.scaleThreshold()
  //   .domain(d3.range(2, 20))
  //   .range(d3.schemeBlues[9]) 


const svg = d3.select('#map')
    .append('svg')
    .attr('height', plotHeight+10)
    .attr('width', plotWidth+100)
    .append("g");


svg.append("rect").attr('width', plotWidth+100).attr('height', plotHeight+10)
      .style('stroke', 'black').style('fill', 'none');

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([640, 720]);

var color = d3.scaleThreshold()
    .domain([3,6,9,12,15,18,21])
    .range(d3.schemeBlues[7]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-200,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Ratio (House price:earnings)");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + ""; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();


  const smallMapSVG = d3.select('#small-map')
    .append('svg')
    .attr('height', 320)
    .attr('width', 220)
    .append("g");

  var regionCenter = d3.geoCentroid(eng)
  var regionScale  = 1200;
  var regionOffset = [220/2, 320/2];
  var regionProjection = d3.geoMercator().scale(regionScale).center(regionCenter)
          .translate(regionOffset); 
  var  regionPath = d3.geoPath().projection(regionProjection);


  smallMapSVG.append("rect").attr('width', 220).attr('height', 320)
      .style('stroke', 'none').style('fill', 'none'); 

  smallMapSVG.append("g")
    .attr("id", "regions") 
    .selectAll("path")
    .data(topojson.feature(regions, regions.objects.eng_regions).features) 
    .enter().append("path") 
    .attr("d", regionPath)
    .style("stroke-width", "1")
    .style("stroke", "white");

  // var legend = svg.append("g")
  //   .attr("id", "legend");

  // var legenditem = legend.selectAll(".legenditem")
  //   .data(d3.range(9))
  //   .enter()
  //   .append("g")
  //     .attr("class", "legenditem")
  //     .attr("transform", function(d, i) { return "translate(" + i * 20 + ",0)"; });

  // legenditem.append("rect")
  //   .attr("x", width - 100)
  //   .attr("y", 24)
  //   .attr("width", 20)
  //   .attr("height", 6)
  //   .attr("class", "rect")
  //   .style("fill", function(d, i) { return legendColors[i]; });

  // legenditem.append("text")
  //   .attr("x", width - 100)
  //   .attr("y", 18)
  //   .style("text-anchor", "middle")
  //   .text(function(d, i) { return legendText[i]; });


  function renderLineChart(geoArea) {
    vegaEmbed('#line-chart', regionLineCharts[geoArea])
  }

  var nfObject = new Intl.NumberFormat('en-US')


  function renderMap(geoArea, year) {
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
      var offset  = [plotWidth + 70 - (bounds[0][0] + bounds[1][0])/2,
                       plotHeight + 42 -(bounds[0][1] + bounds[1][1])/2];

        // new projection
      projection = d3.geoMercator().center(center)
        .scale(scale).translate(offset);

      path = path.projection(projection);}
    else {
      var data = eng.features.filter(function(d) {return d.properties.region_name == geoArea; })

      var regionCode = data[0].properties.region_code
      var center = centroids[regionCode]

      if (geoArea == 'London') {
        var scale = 38000;
        var offset = [plotWidth/2, plotHeight/2];
      } else if (geoArea == 'South East') {
         var scale = 9000;
         var offset = [plotWidth/2-10, plotHeight/2];
      } else if (geoArea == 'North West') {
         var scale = 9000;
         var offset = [plotWidth/2-10, plotHeight/2];
      } else if ( geoArea == 'South West') {
         var offset = [plotWidth/2+60, plotHeight/2];
         var scale = 7500;
      } else {
         var scale  = 11000;
         var offset = [plotWidth/2+20, plotHeight/2];
    }
      var projection = d3.geoMercator().scale(scale).center(center)
          .translate(offset);  

      var path = d3.geoPath().projection(projection);

    }
      slider.property("value", year)
      d3.select('.year').text(year);
    
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
        "<tr><td>Median house price: </td><td>" + " £" + nfObject.format(parseInt(databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]['median_house_price'], 10)) + "</td></tr>" +
        "<tr><td>Median earnings: </td><td>" + " £" + nfObject.format(parseInt(databyLAYear[d.target.__data__.properties.lad19cd][globalYear][0]['median_earnings'], 10)) + "</td></tr></tbody></table>"
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

    smallMapSVG.selectAll("path")
    .attr("fill", function(d) {
    if(d.id === regionCode){
      return "#06063C";
    }});

  }
    renderMap('England', 2019);

    // ["#06063c","#c5741d","#902727","#265886","#dab312"]

};
