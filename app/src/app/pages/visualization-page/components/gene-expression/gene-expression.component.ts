import { Component, OnInit, Input } from '@angular/core'
import { MapComponent } from '../map/map.component'
import { GeneExpDataService } from '../../../../services/gene-exp-data.service'
import * as d3 from 'd3'

interface MarkerProperties {
    position: { lat: number; lng: number }
    name: string
    color: string
    clicked: boolean
}

@Component({
    selector: 'app-gene-expression',
    standalone: true,
    imports: [MapComponent],
    templateUrl: './gene-expression.component.html',
    styleUrl: './gene-expression.component.scss',
})
export class GeneExpressionComponent implements OnInit {
    @Input() width!: number
    @Input() height!: number
    @Input() pinClicked!: MarkerProperties
    clickedPin: MarkerProperties | null = null
    data: any
    selected = [] as string[]
    constructor(private geneExpDataService: GeneExpDataService) {}
    ngOnInit() {
        this.geneExpDataService.fetchGeneExpData().then(data => {
            // console.log(data);
            this.parallelCoordinates(data)
            this.data = data
        })
    }

    onPinClicked(marker: MarkerProperties) {
        this.clickedPin = marker
        this.parallelCoordinates(this.data)
    }

    parallelCoordinates(data: any) {
        const dataColumns = data.columns.length * 3
        const row = Object.keys(data).length
        const pixelsPerDataPoint = 20

        // set the dimensions and margins of the graph
        let margin = { top: 25, right: 50, bottom: 25, left: 20 },
            width = dataColumns * pixelsPerDataPoint - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom
        if (this.width) {
            width = this.width
            height = this.height * 0.7 - margin.top - margin.bottom - 10
        }
        let filter = document.getElementById('filter')
        if (filter) {
            while (filter.firstChild) {
                filter.removeChild(filter.firstChild)
            }
        }
        var svgContainer = d3.select('#PC')
        svgContainer.selectAll('*').remove()

        let columnNames = Object.keys(data[0])

        if (this.clickedPin?.clicked) {
            const matchingColumns = columnNames.filter(
                (columnName: string) =>
                    this.clickedPin &&
                    columnName.toLowerCase().includes(this.clickedPin.name.toLowerCase())
            )
            this.selected.push(...matchingColumns)
        }
        if (!this.clickedPin?.clicked) {
            this.selected = this.selected.filter(
                (item: string) =>
                    this.clickedPin &&
                    !item.toLowerCase().includes(this.clickedPin.name.toLowerCase())
            )
        }
        const emptyCondition = document.getElementById('empty-condition-text')
        if (this.selected.length !== 0) {
            emptyCondition!.style.display = 'none'
        } else {
            svgContainer.selectAll('*').remove()
            emptyCondition!.style.display = 'flex'
            emptyCondition!.style.justifyContent = 'center'
            emptyCondition!.style.alignItems = 'center'
            emptyCondition!.style.height = '15vh'
        }
        let dimensions = columnNames
        let sortAscending: { [key: string]: boolean } = {}
        for (let i in dimensions) {
            sortAscending[dimensions[i]] = true
        }
        let empty = document.getElementById('empty-pc-text')
        // drawChart(dimensions)

        let dimensions2: string[] = []

        for (let i = 0; i < this.selected.length; i++) {
            let btn = document.createElement('button')
            btn.innerHTML = this.selected[i]
            btn.classList.add('filterBtn')
            btn.style.backgroundColor = 'lightgrey'
            btn.style.borderRadius = '10px'
            btn.style.border = 'none'
            btn.style.padding = '5px'
            btn.style.marginRight = '5px'
            btn.style.marginBottom = '5px'
            btn.style.cursor = 'pointer'
            btn.style.width = 'calc( 100%-20% )'
            btn.style.height = '30px'
            btn.style.color = 'white'

            let clicked = false
            btn.addEventListener('click', function () {
                if (!clicked) {
                    dimensions2.push(this.innerHTML)
                    console.log(dimensions2)
                    this.style.backgroundColor = '#4f6d7a'
                    clicked = true
                } else {
                    let index = dimensions2.indexOf(this.innerHTML)
                    if (index !== -1) {
                        dimensions2.splice(index, 1)
                    }
                    this.style.backgroundColor = 'lightgrey'
                    clicked = false
                }
                drawChart(dimensions2)
                if (dimensions2.length !== 0) {
                    empty!.style.display = 'none'
                } else {
                    svgContainer.selectAll('*').remove()
                    empty!.style.display = 'flex'
                    empty!.style.justifyContent = 'center'
                    empty!.style.alignItems = 'center'
                    empty!.style.height = '50vh'
                }
            })
            if (filter) filter.appendChild(btn)
        }
        // }
        function drawChart(dimensions: any) {
            svgContainer.selectAll('*').remove()
            let svg = d3
                .select('#PC')
                .append('svg')
                .attr('width', width - margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + 40 + ',' + margin.top + ')')

            svg.style('opacity', 0) // start with an opacity of 0
                .transition() // add a transition
                .duration(500) // duration of the transition in milliseconds
                .style('opacity', 1) // end with an opacity of 1

            let color = d3
                .scaleOrdinal()
                .domain([
                    data.map(function (d: any) {
                        return d.Gene
                    }),
                ])
                .range(['lightgrey'])

            let y: { [key: string]: any } = {}
            for (let i in dimensions) {
                let currentDimension = dimensions[i]
                let domain = d3.extent(data, function (d: any) {
                    return +d[currentDimension]
                })

                if (domain[0] !== undefined && domain[1] !== undefined) {
                    y[currentDimension] = d3
                        .scaleLinear()
                        .domain(domain as [number, number])
                        .range([height, 0])
                } else {
                    // If the domain is undefined, create a default scale
                    y[currentDimension] = d3.scaleLinear().domain([-1, 1]).range([height, 0])
                }
                sortAscending[currentDimension] = false // Initialize sorting direction for each dimension
            }

            // If the first/last column is of string type, use a point scale instead
            // let stringTypeDimension = dimensions[0]
            // let stringTypeDomain = Array.from(
            //     new Set(
            //         data.map(function (d: any) {
            //             return d[stringTypeDimension]
            //         })
            //     )
            // ) as string[]
            // y[stringTypeDimension] = d3.scalePoint().domain(stringTypeDomain).range([height, 0])

            // Build the X scale -> it find the best position for each Y axis
            let x = d3
                .scalePoint()
                .range([0, width - 85])
                .domain(dimensions)

            // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
            function path(d: any) {
                return d3.line()(
                    dimensions.map(function (p: any) {
                        return [x(p), y[p](d[p])]
                    })
                )
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
                .style('opacity', 0)
                .style('pointer-events', 'none')

            // Draw the lines
            svg.selectAll('myPath')
                .data(data)
                .enter()
                .append('path')
                .attr('class', function (d: any) {
                    return 'line ' + d.Gene
                }) // 2 class for each line: 'line' and the group name
                .attr('d', function (d: any) {
                    return d3.line()(
                        dimensions.map(function (p: any) {
                            return [x(p), y[p](d[p])]
                        })
                    )
                })
                .style('fill', 'none')
                .style('stroke', function (d: any) {
                    return color(d.Gene) as string
                })
                .style('stroke-width', 2)
                .style('opacity', 0.5)
                .style('cursor', 'pointer')
                .on('mouseover', function (event: any, d: any) {
                    // first every group turns grey
                    d3.selectAll('.line')
                        .transition()
                        .duration(200)
                        .style('stroke', 'lightgrey')
                        .style('opacity', '0.2')
                    // Second the hovered specie takes its color
                    // d3.selectAll('.' + selected_species)
                    //     .transition()
                    //     .duration(200)
                    //     .style('stroke', '#53b3bd')
                    //     .style('opacity', '1')
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('stroke', '#53b3bd')
                        .style('stroke-width', 4)
                        .style('opacity', '1')
                    let tooltipWidth = 200 // Replace with your tooltip width
                    let tooltipHeight = 80

                    let container = d3.select('#PC') // Replace with your container selector
                    let containerNode = container.node() as Element
                    let containerRect = containerNode ? containerNode.getBoundingClientRect() : null
                    tooltip.transition().duration(200).style('opacity', 1)
                    tooltip
                        .html(
                            `Gene: ${d.Gene}` +
                                '<br>' +
                                dimensions
                                    .map((dimension: string) => `${dimension}: ${d[dimension]}`)
                                    .join('<br>')
                        )
                        .style('top', function () {
                            let pageY = event.pageY
                            if (containerRect && pageY + tooltipHeight > containerRect.bottom) {
                                return containerRect.bottom - tooltipHeight + 'px' // If the tooltip would go off the bottom of the container, move it up
                            } else {
                                return pageY - tooltipHeight + 'px'
                            }
                        })
                        .style('left', function () {
                            let pageX = event.pageX
                            if (containerRect && pageX + tooltipWidth > containerRect.right) {
                                return containerRect.right - tooltipWidth + 'px' // If the tooltip would go off the right of the container, move it left
                            } else {
                                return pageX - tooltipWidth + 200 + 'px'
                            }
                        })
                })
                .on('mouseleave', function () {
                    d3.selectAll('.line')
                        .transition()
                        .duration(200)
                        .delay(1000)
                        .style('stroke', function (d: any) {
                            return color(d.Gene) as string
                        })
                        .style('opacity', '1')
                        .style('stroke-width', 2)
                    tooltip.transition().duration(200).style('opacity', 0)
                })

            svg.selectAll('myAxis')
                .data(dimensions)
                .enter()
                .append('g')
                .attr('class', 'axis')
                .attr('transform', function (d: any) {
                    return 'translate(' + x(d) + ')'
                })
                .each(function (d: any) {
                    d3.select(this).call(d3.axisLeft(y[d]).ticks(20))
                    d3.select(this).selectAll('path').style('stroke', '#4f6d7a')
                    d3.select(this).selectAll('line').style('stroke', '#4f6d7a')
                    d3.select(this).selectAll('text').style('fill', '#4f6d7a')
                })
                .append('text')
                .attr('class', 'label')
                .style('text-anchor', 'middle')
                .style('font-size', '10px')
                .attr('y', -9)
                .text(function (d: any) {
                    return '▲' + d
                })
                .style('fill', '#4f6d7a')
                .style('cursor', 'pointer')
                .on('mouseover', function () {
                    d3.select(this).style('text-decoration', 'underline')
                })
                .on('mouseleave', function () {
                    d3.select(this).style('text-decoration', 'none')
                })
                .on('click', function (event: any, d: any) {
                    if (y[d]) {
                        if (sortAscending[d]) {
                            y[d].range([0, height])
                            sortAscending[d] = false
                        } else {
                            y[d].range([height, 0])
                            sortAscending[d] = true // Change the sorting direction
                        }
                    } else {
                        console.error('No scale defined for dimension1:', d)
                    }

                    // Redraw the paths with the sorted data
                    svg.selectAll('path').data(data).transition().duration(1000).attr('d', path)

                    // Update the axis
                    svg.selectAll('.axis').each(function (p) {
                        if (p == d) {
                            if (y[d]) {
                                d3.select(this)
                                    .transition()
                                    .duration(1000)
                                    .call((transition: any) =>
                                        d3.axisLeft(y[d]).ticks(20)(transition)
                                    )
                            } else {
                                console.error('No scale defined for dimension2:', d)
                            }
                        }
                    })
                    if (sortAscending[d]) {
                        d3.select(this).text(function (d: any) {
                            return '▲' + d
                        })
                    } else {
                        d3.select(this).text(function (d: any) {
                            return '▼' + d
                        })
                    }
                })
        }
    }
}
