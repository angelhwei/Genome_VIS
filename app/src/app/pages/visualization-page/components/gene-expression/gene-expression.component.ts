import { Component, OnInit, Input, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MapComponent } from '../map/map.component'
import { GeneExpDataService } from '../../../../services/gene-exp-data.service'
import { SequenceExpressionService } from '../../../../services/sequence-expression.service'
import { DataService } from '../../../../services/data.service'
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
    imports: [MapComponent, CommonModule],
    templateUrl: './gene-expression.component.html',
    styleUrl: './gene-expression.component.scss',
})
export class GeneExpressionComponent implements OnInit {
    @Input() width!: number
    @Input() height!: number
    @Input() pinClicked!: MarkerProperties
    @Input() geneDetails!: string

    clickedPin: MarkerProperties | null = null
    data: any
    geneData: any
    selected: { name: string; color: string | undefined }[] = []
    selectedLocation: string[] = []
    color = '#53b3bd'
    highlightColor = '#2D929B'
    geneName = ''
    geneHasMu: string[] = []

    constructor(
        private geneExpDataService: GeneExpDataService,
        private sequenceExpr: SequenceExpressionService,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.geneExpDataService.fetchGeneExpData().then(data => {
            this.parallelCoordinates(data)
            this.data = data
        })
        this.sequenceExpr.currentData.subscribe(data => {
            if (data) {
                this.updateStrokeColor(data)
            }
        })
        this.sequenceExpr.genHasMu.subscribe(data => {
            if (data) {
                this.geneHasMu = data
                this.geneHasMutation(data)
            }
        })
        this.dataService.fetchData().then(data => {
            this.geneData = data
        })
    }

    geneHasMutation(geneHasMu: string[] = []) {
        // console.log('geneHasMutation: ')
        // console.log(geneHasMu)
        d3.selectAll('.line')
            .style('stroke-width', 1)
            .style('opacity', 0.1)
            .style('stroke', '#53b3bd')
        if (geneHasMu.length !== 0) {
            this.data.forEach((d: any) => {
                let geneRename = 'ex-' + d.Gene.replace(/[^\w\s]|_/g, '').toLowerCase()
                if (geneHasMu.includes(d.Gene)) {
                    d3.selectAll('.' + geneRename)
                        .style('stroke-width', 1)
                        .style('stroke', 'rgba(192,36,37,0.5)')
                        .style('opacity', 1)
                    // .raise()
                }
            })
        }
    }

    updateStrokeColor(name: string = '') {
        // if gene has mutation, highlight the line
        if (this.selectedLocation.length < 2) {
            return
        }

        this.geneHasMutation(this.geneHasMu)
        let hasInExpression = this.data.some((el: any) => el['Gene'] === name)

        if (!hasInExpression) {
            const existingTooltip = d3.select('#pc-container').select('.tooltip2')

            if (existingTooltip.empty()) {
                const tooltip2 = d3
                    .select('#pc-container')
                    .style('position', 'relative')
                    .append('div')
                    .attr('class', 'tooltip2')
                    .style('background-color', 'rgba(192,36,37,0.8)')
                    .style('color', '#fff')
                    .style('border-radius', '5px')
                    .style('padding', '10px')
                    .html('No differential expression')
                    .style('position', 'absolute')
                    .style('top', '10%')
                    .style('left', '50%')
                    .style('transform', 'translate(-50%, -50%)')

                setTimeout(() => {
                    tooltip2.remove()
                    d3.select('#pc-container').style('position', 'static')
                }, 500)
            }
            return
        } else {
            let geneRename = 'ex-' + name.replace(/[^\w\s]|_/g, '').toLowerCase()
            d3.selectAll('.' + geneRename)
                .style('stroke-width', 4)
                .style('opacity', 1)
        }
        hasInExpression = false
    }

    onPinClicked(marker: MarkerProperties) {
        this.clickedPin = marker
        this.parallelCoordinates(this.data)
    }

    parallelCoordinates(data: any) {
        const dataColumns = data.columns.length * 3
        const pixelsPerDataPoint = 20
        const svgContainer = d3.select('#PC')
        const columnNames = Object.keys(data[0])
        const empty = document.getElementById('empty-pc-text')
        const emptyCondition = document.getElementById('empty-condition-text')
        let dimensions = columnNames
        let sortAscending: { [key: string]: boolean } = {}
        let dimensions2: string[] = []
        const self = this // Store reference to 'this'

        empty!.style.display = 'flex'
        empty!.style.justifyContent = 'center'
        empty!.style.alignItems = 'center'
        empty!.style.height = '50vh'

        svgContainer.selectAll('*').remove()

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

        if (this.clickedPin?.clicked) {
            const matchingColumns = columnNames
                .filter(
                    (columnName: string) =>
                        this.clickedPin &&
                        columnName.toLowerCase().includes(this.clickedPin.name.toLowerCase())
                )
                .map((columnName: string) => ({
                    name: columnName,
                    color: this.clickedPin?.color, // Add color information
                }))
            this.selected.push(...matchingColumns)
            // console.log('this.selected: ')
            // console.log(this.selected)
        }

        if (!this.clickedPin?.clicked) {
            this.selected = this.selected.filter(
                (item: { name: string; color: string | undefined }) =>
                    this.clickedPin &&
                    !item.name.toLowerCase().includes(this.clickedPin.name.toLowerCase())
            )
        }

        if (this.selected.length !== 0) {
            emptyCondition!.style.display = 'none'
        } else {
            svgContainer.selectAll('*').remove()
            emptyCondition!.style.display = 'flex'
            emptyCondition!.style.justifyContent = 'center'
            emptyCondition!.style.alignItems = 'center'
            emptyCondition!.style.height = '15vh'
        }

        for (let i in dimensions) {
            sortAscending[dimensions[i]] = true
        }

        for (let i = 0; i < this.selected.length; i++) {
            let btn = document.createElement('button')
            btn.innerHTML = this.selected[i].name
            btn.classList.add('filter-btn')
            btn.style.backgroundColor = 'transparent'
            btn.style.borderRadius = '28px'
            btn.style.border = `2px solid ${this.selected[i].color}`
            btn.style.padding = '5px'
            btn.style.marginRight = '6px'
            btn.style.marginBottom = '6px'
            btn.style.cursor = 'pointer'
            btn.style.width = 'calc( 100%-20% )'
            btn.style.height = '30px'
            btn.style.color = 'darkgrey'
            btn.style.fontSize = '12px'

            let borderColor = this.selected[i].color

            btn.addEventListener('mouseover', function () {
                this.style.border = `3px solid ${borderColor}`
            })
            btn.addEventListener('mouseout', function () {
                this.style.border = `2px solid ${borderColor}`
            })

            let clicked = false
            let self = this
            btn.addEventListener('click', function () {
                if (!clicked) {
                    dimensions2.push(this.innerHTML)
                    if (borderColor) {
                        this.style.backgroundColor = hexToRGBA(borderColor, 0.5) // 50% transparency
                    }
                    this.style.color = 'white'
                    clicked = true
                    self.selectedLocation.push(this.innerHTML)
                } else {
                    let index = dimensions2.indexOf(this.innerHTML)
                    if (index !== -1) {
                        dimensions2.splice(index, 1)
                        self.selectedLocation.splice(index, 1)
                    }
                    this.style.backgroundColor = 'transparent'
                    this.style.color = 'darkgrey'
                    clicked = false
                }
                // dimensions2.map(location => {
                //     self.selectedLocation.push(location)
                // })

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

        function hexToRGBA(hex: string, alpha: number) {
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16)

            if (alpha) {
                return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
            } else {
                return 'rgb(' + r + ', ' + g + ', ' + b + ')'
            }
        }

        function drawChart(dimensions: any) {
            const tooltip2 = d3
                .select('#pc-container')
                .style('position', 'relative')
                .append('div')
                .attr('class', 'tooltip2')

            if (dimensions.length === 1) {
                tooltip2
                    .style('background-color', '#5c677d')
                    .style('color', '#fff')
                    .style('border-radius', '5px')
                    .style('padding', '10px')
                    .html('Add another condition')
                    .style('position', 'absolute')
                    .style('top', '40%')
                    .style('left', '50%')
                    .style('transform', 'translate(-50%, -50%)')
            } else {  
                tooltip2.remove()
                d3.select('#pc-container').style('position', 'static')
            }
            svgContainer.selectAll('*').remove()
            let svg = d3
                .select('#PC')
                .append('svg')
                .attr('width', width - margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + 40 + ',' + margin.top + ')')

            svg.style('opacity', 0).transition().duration(500).style('opacity', 1)

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
            let lines = svg.selectAll('myPath').data(data)

            lines
                .enter()
                .append('path')
                .attr('class', function (d: any) {
                    let geneRename = 'ex-' + d.Gene.replace(/[^\w\s]|_/g, '').toLowerCase()
                    return 'line ' + geneRename
                }) // 2 class for each line: 'line' and the group name
                .attr('d', function (d: any) {
                    return d3.line()(
                        dimensions.map(function (p: any) {
                            return [x(p), y[p](d[p])]
                        })
                    )
                })
                .style('fill', 'none')
                .style('stroke', '#53b3bd')
                .style('stroke-width', 1)
                .style('opacity', 0.1)
                .style('cursor', 'pointer')
                .on('mouseover', function (event: any, d: any) {
                    let chrName = ''
                    self.geneData.forEach((chr: any) => {
                        for (let i = 0; i < chr.gene.length; i++) {
                            if (chr.gene[i].name == d.Gene) {
                                chrName = chr.chromosome
                            }
                        }
                    })
                    d3.select(this).style('stroke-width', 4).style('opacity', '1')

                    let tooltipWidth = 200 // Replace with your tooltip width
                    let tooltipHeight = 80
                    let container = d3.select('#PC') // Replace with your container selector
                    let containerNode = container.node() as Element
                    let containerRect = containerNode ? containerNode.getBoundingClientRect() : null

                    tooltip.style('opacity', 1)
                    tooltip
                        .html(
                            `Chr: ${chrName}` +
                                `<br>` +
                                `Gene: ${d.Gene}` +
                                '<br>' +
                                dimensions
                                    .map((dimension: string) => `${dimension}: ${d[dimension]}`)
                                    .join('<br>')
                        )
                        .style('top', function () {
                            let pageY = event.pageY
                            if (containerRect && pageY + tooltipHeight > containerRect.bottom) {
                                return pageY - tooltipHeight + 'px' // Align the bottom of the tooltip with the mouse pointer
                            } else {
                                return pageY - tooltipHeight + 'px' // Align the bottom of the tooltip with the mouse pointer
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
                .on('mouseleave', function (d: any) {
                    d3.selectAll('.line').style('opacity', '0.1').style('stroke-width', 1)
                    tooltip.style('opacity', 0)
                    let geneHasMu = self.geneHasMu
                    for (let d of geneHasMu) {
                        let geneRename = 'ex-' + d.replace(/[^\w\s]|_/g, '').toLowerCase()
                        d3.selectAll('.' + geneRename)
                            .style('stroke-width', 1)
                            .style('stroke', 'rgba(192,36,37,0.5)')
                            .style('opacity', 1)
                    }
                })

            // Update the lines
            lines.attr('d', function (d: any) {
                return d3.line()(
                    dimensions.map(function (p: any) {
                        return [x(p), y[p](d[p])]
                    })
                )
            })

            // Remove the lines
            lines.exit().remove()

            // Draw axis
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
                .style('fill', function (d: any) {
                    if (!self.selected) {
                        return null // or handle the case when this.selected is undefined
                    }
                    let item = self.selected.find(item => item.name === d)
                    let color = item?.color as string
                    // console.log('item: ')
                    // console.log(item?.color)

                    return item ? color : '#4f6d7a'
                })
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

                    let self = this // Assign 'this' to 'self' outside the callback
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

            self.geneHasMutation(self.geneHasMu) // Use 'self' instead of 'this'
        }
    }
}
