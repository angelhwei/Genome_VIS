import { Component, OnInit } from '@angular/core';
import { GeneExpDataService } from '../../../../services/gene-exp-data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-gene-expression',
  standalone: true,
  imports: [],
  templateUrl: './gene-expression.component.html',
  styleUrl: './gene-expression.component.scss',
})
export class GeneExpressionComponent implements OnInit {
  constructor(private geneExpDataService: GeneExpDataService) {}
  ngOnInit() {
    this.geneExpDataService.fetchGeneExpData().then((data) => {
      // console.log(data);
      this.parallelCoordinates(data);
    });
  }

  parallelCoordinates(data: any) {
    // console.log(data[1]);

    // set the dimensions and margins of the graph
    let margin = { top: 30, right: 50, bottom: 10, left: 50 },
      width = 370 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    let filter = document.getElementById('filter');
    if (filter) {
      while (filter.firstChild) {
        filter.removeChild(filter.firstChild);
      }
    }
    var svgContainer = d3.select('#PC');
    svgContainer.selectAll('*').remove();

    let columnNames = Object.keys(data[0]);
    let dimensions = columnNames;

    let sortAscending: { [key: string]: boolean } = {};
    for (let i in dimensions) {
      sortAscending[dimensions[i]] = true;
    }

    drawChart(dimensions);

    for (let i = 1; i < columnNames.length; i++) {
      let btn = document.createElement('button');
      btn.innerHTML = columnNames[i];
      btn.classList.add('filterBtn');
      btn.style.backgroundColor = '#53b3bd';
      btn.style.borderRadius = '10px';
      btn.style.border = 'none';
      btn.style.padding = '5px';
      btn.style.cursor = 'pointer';
      btn.style.width = 'calc( 100%-20% )';

      let clicked = false; // Add this line
      btn.addEventListener('click', function () {
        console.log('click');
        if (!clicked) {
          // If the button has not been clicked, remove the dimension from the dimensions array
          let index = dimensions.indexOf(this.innerHTML);
          if (index !== -1) {
            dimensions.splice(index, 1);
          }

          // Change the background color of the button
          this.style.backgroundColor = 'lightgrey';
          // Set the flag to true
          clicked = true;
        } else {
          // If the button has been clicked, add the dimension back to the dimensions array
          dimensions.push(this.innerHTML);

          // Reset the background color of the button
          this.style.backgroundColor = '#53b3bd';
          // Set the flag to false
          clicked = false;
        }
        drawChart(dimensions);
      });
      if (filter) filter.appendChild(btn);
    }

    function drawChart(dimensions: any) {
      svgContainer.selectAll('*').remove();

      // append the svg object to the body of the page
      var svg = d3
        .select('#PC')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Color scale: give me a specie name, I return a color
      var color = d3
        .scaleOrdinal()
        .domain([
          data.map(function (d: any) {
            return d.Gene;
          }),
        ])
        .range(['lightgrey']);

      let y: { [key: string]: any } = {};
      for (let i in dimensions) {
        let currentDimension = dimensions[i];
        let domain = d3.extent(data, function (d: any) {
          return +d[currentDimension];
        });

        if (domain[0] !== undefined && domain[1] !== undefined) {
          y[currentDimension] = d3
            .scaleLinear()
            .domain(domain as [number, number])
            .range([height, 0]);
        } else {
          // If the domain is undefined, create a default scale
          y[currentDimension] = d3
            .scaleLinear()
            .domain([0, 1])
            .range([height, 0]);
        }
        sortAscending[currentDimension] = false; // Initialize sorting direction for each dimension
      }

      // If the last column is of string type, use a point scale instead
      let stringTypeDimension = dimensions[0];
      let stringTypeDomain = Array.from(
        new Set(
          data.map(function (d: any) {
            return d[stringTypeDimension];
          })
        )
      ) as string[];

      y[stringTypeDimension] = d3
        .scalePoint()
        .domain(stringTypeDomain)
        .range([height, 0]);

      // Build the X scale -> it find the best position for each Y axis
      let x = d3.scalePoint().range([0, width]).domain(dimensions);

      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d: any) {
        return d3.line()(
          dimensions.map(function (p: any) {
            return [x(p), y[p](d[p])];
          })
        );
      }
      const tooltip = d3
        .select('#PC')
        .append('div')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('border-radius', '5px')
        .style('position', 'absolute')
        .style('class', 'tooltip')
        .style('padding', '10px')
        .style('opacity', 0);

      // Draw the lines
      svg
        .selectAll('myPath')
        .data(data)
        .enter()
        .append('path')
        .attr('class', function (d: any) {
          return 'line ' + d.Gene;
        }) // 2 class for each line: 'line' and the group name
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', function (d: any) {
          return color(d.Gene) as string;
        })
        .style('stroke-width', 4)
        .style('opacity', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (d: any, event: any) {
          let selected_specie = event.Gene;

          // first every group turns grey
          d3.selectAll('.line')
            .transition()
            .duration(200)
            .style('stroke', 'lightgrey')
            .style('opacity', '0.2');
          // Second the hovered specie takes its color
          d3.selectAll('.' + selected_specie)
            .transition()
            .duration(200)
            .style('stroke', '#53b3bd')
            .style('opacity', '1');
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(event.Gene)
            .style('top', d.pageY + 15 + 'px')
            .style('left', d.pageX + 5 + 'px');
        })
        .on('mouseleave', function () {
          d3.selectAll('.line')
            .transition()
            .duration(200)
            .delay(1000)
            .style('stroke', function (d: any) {
              return color(d.Gene) as string;
            })
            .style('opacity', '1');
          tooltip.transition().duration(200).style('opacity', 0);
        });

      svg
        .selectAll('myAxis')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', 'axis')
        .attr('transform', function (d: any) {
          return 'translate(' + x(d) + ')';
        })
        .each(function (d: any) {
          d3.select(this).call(d3.axisLeft(y[d]).ticks(5));
        })
        .append('text')
        .attr('class', 'label')
        .style('text-anchor', 'middle')
        .attr('y', -9)
        .text(function (d: any) {
          return d;
        })
        .style('fill', 'black')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          d3.select(this).style('text-decoration', 'underline');
          //.transition().duration(1000)
        })
        .on('mouseleave', function () {
          d3.select(this).style('text-decoration', 'none');
        })
        .on('click', function (event: any, d: any) {
          if (y[d]) {
            if (sortAscending[d]) {
              y[d].range([0, height]);
              sortAscending[d] = false;
            } else {
              y[d].range([height, 0]);
              sortAscending[d] = true; // Change the sorting direction
            }
          } else {
            console.error('No scale defined for dimension1:', d);
          }

          // Redraw the paths with the sorted data
          svg
            .selectAll('path')
            .data(data)
            .transition()
            .duration(1000)
            .attr('d', path);

          // Update the axis
          svg.selectAll('.axis').each(function (p) {
            if (p == d) {
              if (y[d]) {
                d3.select(this)
                  .transition()
                  .duration(1000)
                  .call((transition: any) =>
                    d3.axisLeft(y[d]).ticks(5)(transition)
                  );
              } else {
                console.error('No scale defined for dimension2:', d);
              }
            }
          });
        });
    }
  }
}
