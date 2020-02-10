const mapWidth = 1000;
const mapHeight = 758;
const scale = 190000;
const maxRadius = 8;

let pointer1, pointer2;
let pointer1Radius = maxRadius, pointer2Radius = maxRadius;
let minimumScore = 1;

let data;

const projection = d3.geoMercator()
  .center([-122.061578, 37.385532])
  .scale(scale)
  .translate([mapWidth / 2, mapHeight / 2]);
const pixelsPerMile = mapWidth / distance(
  projection.invert([0, 0])[1], projection.invert([0, 0])[0],
  projection.invert([mapWidth, 0])[1], projection.invert([mapWidth, 0])[0]
);

// Add an SVG element to the DOM
const svg = d3.select('#vis').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight);

// https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function drawMap() {
  // Add SVG map at correct size, assuming map is saved in a subdirectory called `data`
  svg.append('image')
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .attr('xlink:href', 'data/map.svg')
}

function getLongitude(d) {
  return projectiond['Longitude']
}

const scoreScale = d3.scaleLinear()
  .domain([65, 100])
  .range([0, 1])
  .clamp(true);

function drawRestaurants(data) {
  const circles = svg.selectAll('circle')
    .filter('.restaurant')
    .data(data, d => d['Name'] + d['Latitude'] + d['Longitude']);
  circles.enter().append('circle')
    .attr('class', 'restaurant')
    .attr('r', 3)
    .attr('cx', d => projection([d['Longitude'], d['Latitude']])[0])
    .attr('cy', d => projection([d['Longitude'], d['Latitude']])[1])
    .attr('fill', d => d3.interpolateBlues(scoreScale(parseInt(d['Score']))))
    .on('mouseover', function (d) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr('r', 5)
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d['Name'] + "<br/>" + d['Address'] + "<br/>" + `Score: ${d['Score']}`)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .style("color", 'white')
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .transition()
        .delay(100)
        .attr('r', 3);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
  circles.exit().remove();
}

function dragCallback(d) {
  d3.select(this)
    .attr('cx', d3.event.x)
    .attr('cy', d3.event.y);
  d3.select(`.${d3.select(this).attr('class')}Border`)
    .attr('cx', d3.event.x)
    .attr('cy', d3.event.y);
  drawRestaurants(filterData(data));
}

function drawPointers() {
  pointer1Border = svg.insert('circle')
    .attr('class', 'pointer1Border')
    .attr('r', pixelsPerMile * pointer1Radius)
    .attr('cx', mapWidth / 2)
    .attr('cy', mapHeight / 2)
    .attr('fill-opacity', 0.0)
    .style('stroke', '#e74c3c')
    .style('stroke-dasharray', '10 5')
  pointer2Border = svg.insert('circle')
    .attr('class', 'pointer2Border')
    .attr('r', pixelsPerMile * pointer2Radius)
    .attr('cx', mapWidth / 2)
    .attr('cy', mapHeight / 2 + 10)
    .attr('fill-opacity', 0.0)
    .style('stroke', '#16a085')
    .style('stroke-dasharray', '10 5')
  pointer1 = svg.append('circle')
    .attr('class', 'pointer1')
    .attr('r', 6)
    .attr('cx', mapWidth / 2)
    .attr('cy', mapHeight / 2)
    .style('fill', '#e74c3c')
    .on('mouseover', function () { d3.select(this).style("cursor", "pointer") })
    .on("mouseout", function () { d3.select(this).style("cursor", "default") })
    .call(d3.drag().on('drag', dragCallback));
  pointer2 = svg.append('circle')
    .attr('class', 'pointer2')
    .attr('r', 6)
    .attr('cx', mapWidth / 2 + 10)
    .attr('cy', mapHeight / 2)
    .style('fill', '#16a085')
    .on('mouseover', function () { d3.select(this).style("cursor", "pointer") })
    .on("mouseout", function () { d3.select(this).style("cursor", "default") })
    .call(d3.drag().on('drag', dragCallback));
}


const SCALE_LENGTH = pixelsPerMile;
function drawScale() {
  svg.append('line')
    .attr('x1', mapWidth - 50)
    .attr('x2', mapWidth - 50 - SCALE_LENGTH)
    .attr('y1', mapHeight - 30)
    .attr('y2', mapHeight - 30)
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1)
  svg.append('line')
    .attr('x1', mapWidth - 50)
    .attr('x2', mapWidth - 50)
    .attr('y1', mapHeight - 35)
    .attr('y2', mapHeight - 25)
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1)
  svg.append('line')
    .attr('x1', mapWidth - 50 - SCALE_LENGTH)
    .attr('x2', mapWidth - 50 - SCALE_LENGTH)
    .attr('y1', mapHeight - 35)
    .attr('y2', mapHeight - 25)
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1)
  svg.append('text')
    .attr('x', mapWidth - 40 - SCALE_LENGTH)
    .attr('y', mapHeight - 10)
    .attr('fill', 'steelblue')
    .text("1 mile");
}

// https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}

drawMap();
drawScale();
d3.csv('data/restaurants.csv').then(function (csvData) {
  data = csvData;
  drawPointers();
  drawRestaurants(data);
});

svg.selectAll('image')
  .on('click', function () {
    console.log(d3.mouse(this));
  })

function filterData(data) {
  const pointer1LonLat = projection.invert([pointer1.attr('cx'), pointer1.attr('cy')]);
  const pointer2LonLat = projection.invert([pointer2.attr('cx'), pointer2.attr('cy')]);
  return data.filter(d => {
    const distanceFromPointer1 = distance(
      pointer1LonLat[1], pointer1LonLat[0], d['Latitude'], d['Longitude']
    );
    const distanceFromPointer2 = distance(
      pointer2LonLat[1], pointer2LonLat[0], d['Latitude'], d['Longitude']
    );
    return (distanceFromPointer1 <= pointer1Radius) &&
      (distanceFromPointer2 <= pointer2Radius) &&
      (parseInt(d['Score']) >= minimumScore);
  });
}

const sliderScale = d3.scaleLinear()
  .domain([1, 100])
  .range([0.1, maxRadius]);
const slider1 = document.getElementById('slider1');
const slider2 = document.getElementById('slider2');
const slider3 = document.getElementById('slider3');
slider1.addEventListener('input', function () {
  pointer1Radius = sliderScale(slider1.value);
  document.getElementById("radius1").innerHTML = `${Math.round(pointer1Radius * 100) / 100} miles`;
  d3.select('.pointer1Border')
    .attr('r', pixelsPerMile * pointer1Radius)
  drawRestaurants(filterData(data));
})
slider2.addEventListener('input', function () {
  pointer2Radius = sliderScale(slider2.value);
  document.getElementById("radius2").innerHTML = `${Math.round(pointer2Radius * 100) / 100} miles`;
  d3.select('.pointer2Border')
    .attr('r', pixelsPerMile * pointer2Radius)
  drawRestaurants(filterData(data));
})
slider3.addEventListener('input', function () {
  minimumScore = slider3.value;
  document.getElementById("minscore").innerHTML = slider3.value;
  drawRestaurants(filterData(data));
})
