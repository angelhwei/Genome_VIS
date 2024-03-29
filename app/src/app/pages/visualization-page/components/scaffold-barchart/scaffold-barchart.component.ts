import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core'
import * as d3 from 'd3'
import { DataService } from '../../../../services/data.service'
import { ShareService } from '../../../../services/share.service'

@Component({
    selector: 'app-scaffold-barchart',
    standalone: true,
    imports: [],
    templateUrl: './scaffold-barchart.component.html',
    styleUrl: './scaffold-barchart.component.scss',
})
export class ScaffoldBarchartComponent implements OnInit {
    @Output() dataEmitter = new EventEmitter<any>()
    @Input() width!: number
    @Input() height!: number
    data: any
    constructor(private dataService: DataService, private shareService: ShareService) {}

    ngOnChanges() {
        this.barchart(this.data)
    }

    ngOnInit() {
        this.dataService.fetchData().then(data => {
            this.barchart(data)
            this.data = data
        })
    }

    barchart(data: any) {
        let width = 1200
        let height = 180
        if (this.width) {
            width = this.width
            height = this.height * 0.7
        }
        let margin = { top: 20, right: 30, bottom: 60, left: 90 },
            barWidth = width - margin.left - margin.right - margin.top,
            barHeight = height - margin.top - margin.bottom
        let svg = d3
            .select('#scaffold-barchart')
            .append('svg')
            .attr('width', width)
            .attr('height', height + margin.right + margin.bottom + margin.left)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        let x = d3
            .scaleBand()
            .range([0, barWidth])
            .padding(0.2)
            .domain(
                data.map(function (d: any) {
                    return d.chromosome
                })
            )
        let xAxis = d3.axisBottom(x)
        let tickValues = data
            .filter(function (d: any) {
                return d.mutation.length > 0
            })
            .map(function (d: any) {
                return d.chromosome
            })

        // x axis
        xAxis.tickValues(tickValues)
        svg.append('g')
            .attr('transform', 'translate(0,' + barHeight + ')')
            .call(d3.axisBottom(x))
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end')
            .attr('font-size', '7px')

        const tooltip = d3
            .select('#scaffold-barchart')
            .append('div')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('border-radius', '5px')
            .style('position', 'absolute')
            .style('class', 'tooltip')
            .style('padding', '10px')
            .style('opacity', 0)
            .style('pointer-events', 'none')

        let lengths = data.map(function (d: any) {
            return d.length
        })
        let maxLen = Math.floor(Math.max(...lengths))
        let y = d3.scaleLog().domain([10000, maxLen]).range([barHeight, 0])
        let yAxis = d3.axisLeft(y).ticks(3)

        svg.append('g').call(yAxis)
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 10 + 'px') // Adjust the position of the label from the left margin
            .attr('x', 0 - barHeight / 2) // Adjust the position of the label from the top
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Scaffold Length')
            .attr('fill', '#6c757d')
        svg.selectAll('myline')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d: any) => x(d.chromosome) as any)
            .attr('y', function (d: any) {
                return barHeight
            })
            .attr('width', 7)
            .attr('height', function (d) {
                return 0
            })
            .attr('fill', '#BDC3C7')
            .attr('cursor', 'pointer') // Set the cursor to indicate it's clickable
            .on('mouseover', function (event, d: any) {
                // console.log(d.chromosome);
                tooltip.transition().duration(200).style('opacity', 1)
                tooltip.html(`Chr: ${d.chromosome} Length: ${d.length}`)
                tooltip.style('top', event.pageY - 35 + 'px').style('left', event.pageX + 5 + 'px')

                d3.select(this).style('fill', '#e07a5f')
            })
            .on('mouseout', function () {
                tooltip.transition().duration(200).style('opacity', 0)
                d3.select(this).style('fill', '#BDC3C7')
            })
            .on('click', function (event, d: any) {
                // Remove any existing images
                d3.selectAll('image').remove()

                // Add an image above the clicked bar
                d3.select('svg') // Select the SVG element
                    .append('image')
                    .attr('xlink:href', '../../../../../assets/down.png') // Replace with your image path
                    .attr('width', 15 + 'px')
                    .attr('height', 15 + 'px')
                    .attr('x', (x(d.chromosome) || 0) + 86) // Position the image above the bar (5 is the padding)
                    .attr('y', y(d.length) - 1) // Position the image above the bar

                d3.selectAll('rect').style('stroke', 'none')
                d3.select(this).style('stroke-width', '1').style('stroke', '#e07a5f')

                callEmit(10, 1000, d.chromosome)
                // console.log(d.chromosome);
                d3.select('#chr_name').text(d.chromosome)
                d3.select('#content2').text('') // Clear the content
                d3.select('#content2')
                    .style('opacity', 0) // 將 content2 的透明度變為 0
                    .transition()
                    .duration(500)
                    .style('opacity', 1)
            })

        // Animation
        svg.selectAll('rect')
            .transition()
            .duration(500)
            .attr('y', function (d: any) {
                return y(d.length)
            })
            .attr('height', function (d: any) {
                return barHeight - y(d.length)
            })
            .delay(function (d, i) {
                return i * 100
            })

        let flatData = data.reduce(function (acc: any, d: any) {
            d.mutation.forEach(function (m: any) {
                acc.push({
                    chromosome: d.chromosome,
                    mutation: m,
                })
            })
            return acc
        }, [])

        // circle
        svg.selectAll('mycircle')
            .data(flatData)
            .enter()
            .append('circle')
            .attr('cx', (d: any) => {
                return d.chromosome
            })
            .attr('cy', function (d: any) {
                return y(d.mutation.BP)
            })
            .attr('r', function (d: any) {
                return d.mutation.muValues * 10
            })
            .style('fill', function (d) {
                return 'rgba(192,36,37,0.4)' // Apply a different fill color for data with PopID "OL"
            })
            .attr('cursor', 'pointer') // Set the cursor to indicate it's clickable
            .on('mouseover', function (event, d: any) {
                tooltip.transition().duration(200).style('opacity', 1)
                tooltip
                    .html(
                        `Chr: ${d.chromosome} <br> BP: ${d.mutation.BP} <br> Degree: ${d.mutation.muValues}`
                    )
                    .style('left', event.clientX + 70 + 'px')
                    .style('top', event.clientY + 'px')
                    .style('background-color', 'rgba(0, 0, 0, 0.8)')
                    .style('color', '#fff')
                    .style('border-radius', '5px')
                    .style('padding', '5px')
                d3.select(this)
                    .transition() // Add transition effect
                    .duration(200) // Set the transition duration in milliseconds
                    .attr('r', function (d: any) {
                        return d.mutation.muValues * 10 + 5
                    })
            })
            .on('mouseout', function () {
                tooltip.transition().duration(200).style('opacity', 0)
                d3.select(this)
                    .transition() // Add transition effect
                    .duration(200) // Set the transition duration in milliseconds
                    .attr('r', function (d: any) {
                        return d.mutation.muValues * 10
                    })
            })
            .on('click', function (d) {
                // Clear the stroke of all circles
                d3.selectAll('circle').attr('stroke', 'none').attr('stroke-width', '0px')

                d3.select('#chr_name').text(d.chromosome)
                d3.select('#content2').text('') // Clear the content

                d3.select(this)
                    .classed('selected', true)
                    .attr('stroke', '#c02425')
                    .attr('stroke-width', '3px')

                callEmit(10, 1000, d.chromosome) // Update the content with the selected bar's data
                d3.select('#content2')
                    .style('opacity', 0) // 將 content2 的透明度變為 0
                    .transition()
                    .duration(500)
                    .style('opacity', 1)
            })
            .filter(function (d: any) {
                return d.mutation.MuValues == 0
            }) // Filter out data with Value equal to 0
            .style('display', 'none') // Hide the circle for data with Value equal to 0

        svg.selectAll('mycircle')
            .data(flatData)
            .enter()
            .append('circle')
            .attr('cx', (d: any) => {
                return d.chromosome
            })
            .attr('cy', function (d: any) {
                return y(d.mutation.BP)
            })
            .attr('r', 1.5)
            .style('fill', function (d) {
                return 'rgba(192,140,1,1)' // Apply a different fill color for data with PopID "OL"
            })

        const callEmit = (squareWidth: Number, compressionNum: Number, scaffold: any) => {
            this.emitData(squareWidth, compressionNum, scaffold)
        }
    }

    emitData(squareWidth: Number, compressionNum: Number, scaffold: any) {
        const data = { squareWidth, compressionNum, scaffold }
        // this.dataEmitter.emit(data);
        this.shareService.changeData(data)
    }
}
