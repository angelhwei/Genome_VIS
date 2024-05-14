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
        let margin = { top: 15, right: 30, bottom: 35, left: 90 },
            barWidth = width - margin.left - margin.right - margin.top,
            barHeight = height - margin.top - margin.bottom * 2,
            padding = 0.4
        let svg = d3
            .select('#scaffold-barchart')
            .append('svg')
            .attr('width', width)
            .attr('height', barHeight + height / 2 + 5)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        let x = d3
            .scaleBand()
            .range([0, barWidth])
            .padding(padding)
            .domain(
                data.map(function (d: any) {
                    return d.chromosome
                })
            )
        let xAxis = d3.axisBottom(x)
        let tickValues = data
            .filter(function (d: any) {
                return d.mutation.length > 1
            })
            .map(function (d: any) {
                return d.chromosome
            })

        // x axis
        xAxis.tickValues(tickValues)
        svg.append('g')
            .attr('transform', 'translate(0,' + barHeight + ')')
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end')
            .attr('font-size', '0.6vw')
            .attr('cursor', 'default')

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
        let y = d3.scaleLog([10000, maxLen], [barHeight, 0]).base(2) // d3.scaleLog([domain],[range])
        let yAxis = d3.axisLeft(y).ticks(3).tickFormat(d3.format('.0s'))

        svg.append('g')
            .call(yAxis)
            .call(g => g.select('.domain').remove())
        // Make the y axis line and ticks thinner
        svg.selectAll('.domain').style('stroke-width', '0.5px')
        svg.selectAll('.tick line').style('stroke-width', '0.5px')

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 10 + 'px')
            .attr('x', 0 - barHeight / 2 - 10 + 'px')
            .attr('dy', '1.5em')
            .style('text-anchor', 'middle')
            .text('Length (log)')
            .attr('font-size', '12px')
            .attr('fill', '#6c757d')

        svg.selectAll('myline')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d: any) => x(d.chromosome) as any)
            .attr('y', function (d: any) {
                return barHeight
            })
            .attr('width', x.bandwidth())
            .attr('height', function (d) {
                return 0
            })
            .attr('fill', '#adb5bd')
            .attr('class', (d: any) => `bar-${d.chromosome.replace(/[^a-zA-Z0-9]/g, '')}`)
            .attr('cursor', 'pointer')
            .on('mouseover', function (event, d: any) {
                tooltip.style('opacity', 1)
                tooltip.html(
                    `Chr: ${d.chromosome} <br /> Length: ${d.length} <br /> Mutation Count: ${d.mutation.length}`
                )
                tooltip.style('top', event.pageY - 35 + 'px').style('left', event.pageX + 5 + 'px')

                d3.select(this).style('fill', '#5c677d')
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0)
                d3.select(this).style('fill', '#adb5bd')
            })
            .on('click', function (event, d: any) {
                // Remove any existing images
                // d3.selectAll('image').remove()
                d3.selectAll('rect').style('stroke', 'none')
                d3.selectAll('circle').attr('stroke', 'none')
                d3.select(this).style('stroke-width', '4').style('stroke', '#5c677d')

                // Add an image above the clicked bar
                // d3.select('svg')
                //     .append('image')
                //     .attr('xlink:href', '../../../../../assets/down2.png')
                //     .attr('width', 15 + 'px')
                //     .attr('height', 15 + 'px')
                //     .attr('x', (x(d.chromosome) || 0) + 88)
                //     .attr('y', y(d.length) - 1)

                callEmit(10, 1000, d.chromosome)
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
            .duration(300)
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

        const tooltip2 = d3
            .select('#scaffold-barchart')
            .append('div')
            .style('background-color', 'rgba(100, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('border-radius', '5px')
            .style('position', 'absolute')
            .style('class', 'tooltip')
            .style('padding', '10px')
            .style('opacity', 0)
            .style('pointer-events', 'none')

        // circle
        svg.selectAll('mycircle')
            .data(flatData)
            .enter()
            .append('circle')
            .attr('class', (d: any) => `circle-${d.mutation.BP}`)
            .attr('cx', (d: any) => (x(d.chromosome) as any) + x.bandwidth() / 2)
            .attr('cy', function (d: any) {
                if (!d.mutation.BP) {
                    console.log(
                        'Error: BP is undefined, d.chomosome:' +
                            d.chromosome +
                            'd.mutation.BP:' +
                            d.mutation.BP
                    )
                }
                return y(d.mutation.BP)
            })
            .style('fill', function (d) {
                return 'rgba(192,36,37,0.1)'
            })
            .style('opacity', 0)
            .attr('cursor', 'pointer') // Set the cursor to indicate it's clickable
            .on('mouseover', function (event, d: any) {
                tooltip2.style('opacity', 1)
                tooltip2
                    .html(
                        `Chr: ${d.chromosome} <br> BP: ${d.mutation.BP} <br> Degree: ${d.mutation.muValues}`
                    )
                    .style('left', event.clientX + 10 + 'px')
                    .style('top', event.clientY + 'px')

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', function (d: any) {
                        let r = d.mutation.muValues < 0.3 ? 0.3 * 10 : d.mutation.muValues * 10
                        return r + 5
                    })
            })
            .on('mouseout', function () {
                tooltip2.style('opacity', 0)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', function (d: any) {
                        let r = d.mutation.muValues < 0.3 ? 0.3 * 10 : d.mutation.muValues * 10
                        return r
                    })
            })
            .on('click', function (event, d: any) {
                // Remove any existing images
                // d3.selectAll('image').remove()
                d3.selectAll('circle').attr('stroke', 'none').attr('stroke-width', '0px')
                const bar = d3.select(`.bar-${d.chromosome.replace(/[^a-zA-Z0-9]/g, '')}`)
                d3.selectAll('rect').style('stroke', 'none')
                bar.style('stroke-width', '4').style('stroke', '#5c677d')

                // Add an image above the clicked bar
                // d3.select('svg')
                //     .append('image')
                //     .attr('xlink:href', '../../../../../assets/down2.png')
                //     .attr('width', 15 + 'px')
                //     .attr('height', 15 + 'px')
                //     .attr('x', (x(d.chromosome) || 0) + 87 )
                //     .attr('y', y(d.length) - 1)

                callEmit(10, 1000, d.chromosome)
                d3.select('#chr_name').text(d.chromosome)
                d3.select('#content2').text('')
                d3.select('#content2')
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .style('opacity', 1)
            })
            .filter(function (d: any) {
                return d.mutation.muValues == 0
            }) // Filter out data with Value equal to 0
            .style('display', 'none') // Hide the circle for data with Value equal to 0

        // Animation
        svg.selectAll('circle')
            .transition()
            .duration(1000)
            .attr('cy', function (d: any) {
                return y(d.mutation.BP)
            })
            .attr('r', function (d: any) {
                let r = d.mutation.muValues < 0.3 ? 0.3 * 10 : d.mutation.muValues * 10
                return r
            })
            .delay(function (d, i) {
                return i * 2.5
            })
            .style('opacity', 1)

        // svg.selectAll('mycircle')
        //     .data(flatData)
        //     .enter()
        //     .append('circle')
        //     .attr('cx', (d: any) => x(d.chromosome) as any + x.bandwidth() / 2)
        //     .attr('cy', function (d: any) {
        //         return y(d.mutation.BP)
        //     })
        //     .attr('r', 1.5)
        //     .style('fill', function (d) {
        //         return 'rgba(192,140,1,1)' // Apply a different fill color for data with PopID "OL"
        //     })

        const callEmit = (squareWidth: Number, compressionNum: Number, scaffold: any) => {
            this.shareService.changeData({ squareWidth, compressionNum, scaffold })
        }
    }
}
