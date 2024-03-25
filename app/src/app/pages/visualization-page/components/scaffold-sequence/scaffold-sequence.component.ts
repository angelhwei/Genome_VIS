import { Component, Input, Output, EventEmitter } from '@angular/core'
import * as d3 from 'd3'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatNativeDateModule } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ShareService } from '../../../../services/share.service'
import { DataService } from '../../../../services/data.service'
import { FormsModule } from '@angular/forms'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { ThemePalette } from '@angular/material/core'

@Component({
    selector: 'app-scaffold-sequence',
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatExpansionModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './scaffold-sequence.component.html',
    styleUrl: './scaffold-sequence.component.scss',
})
export class ScaffoldSequenceComponent {
    @Input() width!: number
    @Output() geneClicked = new EventEmitter<string>()

    colorControl = new FormControl('warn' as ThemePalette)
    squareWidth: number = 10
    compressionNum: number = 1000
    scaffold!: string

    constructor(private shareService: ShareService, private dataService: DataService) {}

    ngOnInit() {
        this.shareService.currentData.subscribe(data => {
            if (data) {
                this.scaffold = data.scaffold
                this.handleData()
            }
        })
    }

    handleClick() {
        d3.select('#content2').text('') // Clear the content
        this.handleData()
    }

    drawCircle(
        svg: any,
        x: number,
        y: number,
        radius: number,
        c: any,
        opacity: any,
        details: string
    ) {
        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 3)
            .attr('fill', c)
            .style('opacity', 0.9)
            .style('stroke', 'none')

        const circle = svg
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', radius)
            .attr('fill', c)
            .style('opacity', 0.5)
            .style('stroke', 'none') // Initially, no stroke
            .attr('cursor', 'pointer')

        // circle.raise();
        // Create a tooltip
        const tooltip = d3
            .select('#content2')
            .append('div')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('border-radius', '5px')
            .style('position', 'absolute')
            .style('class', 'tooltip')
            .style('padding', '10px')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('z-index', '100')

        // Add event handlers
        circle
            .on('mouseover', (event: any) => {
                tooltip.style('opacity', 1)
                tooltip
                    .html(details)
                    .style('left', event.pageX + 2 + 'px')
                    .style('top', event.pageY - 2 + 'px')

                d3.select(event.target).style('stroke', '#c02425').style('stroke-width', '2px')
            })
            .on('mouseout', (event: any) => {
                tooltip.style('opacity', 0)
                d3.select(event.target).style('stroke', 'none').style('stroke-width', '0')
            })
    }

    drawRectangle(
        svg: any,
        x: number,
        y: number,
        w: number,
        h: number,
        c: any,
        last: any,
        lastPosition: any
    ) {
        // Append a rectangle element to the SVG
        const rectangle = svg
            .append('rect')
            // Set the x and y coordinates of the rectangle
            .attr('x', x)
            .attr('y', y)
            // Set the width and height of the rectangle
            .attr('width', w)
            .attr('height', h)
            // Set the fill color of the rectangle
            .attr('fill', c)
            .style('opacity', 0.7)
        rectangle.lower()
        if (last) {
            svg.append('text')
                // Set the x and y coordinates of the text
                .attr('x', x + w * 1.5)
                .attr('y', y + w)
                // Set the content of the text
                .text(lastPosition)
                .style('font-size', w) // Replace '20px' with the desired font size
                .on('mouseover', (event: any) => {
                    if (w <= 5) {
                        d3.select(event.target).style('font-size', 10) // Double the font size on mouseover
                    }
                })
                .on('mouseout', (event: any) => {
                    if (w <= 5) {
                        d3.select(event.target).style('font-size', w) // Restore the original font size on mouseout
                    }
                })
        }
    }

    drawGeneRectangle(
        svg: any,
        x: number,
        y: number,
        w: number,
        h: number,
        c: any,
        details: string,
        last: any,
        lastPosition: any,
        geneName: string
    ) {
        let geneRename = 'seq-' + geneName.replace(/[^\w\s]|_/g, '').toLowerCase()
        console.log('geneRename:')
        console.log(geneRename)
        // Append a rectangle element to the SVG
        const rectangle = svg
            .append('rect')
            .attr('class', function (d: any) {
                return 'gene ' + geneRename
            })
            .attr('x', x)
            .attr('y', y)
            .attr('width', w)
            .attr('height', h)
            .attr('fill', c)
            .style('opacity', 0.7)
            .attr('cursor', 'pointer')

        rectangle.lower()

        if (last) {
            svg.append('text')
                .attr('x', x + w * 1.5)
                .attr('y', y + w)
                .text(lastPosition)
                .style('font-size', w)
                .on('mouseover', (event: any) => {
                    if (w <= 5) {
                        d3.select(event.target).style('font-size', 10)
                    }
                })
                .on('mouseout', (event: any) => {
                    if (w <= 5) {
                        d3.select(event.target).style('font-size', w)
                    }
                })
        }

        const tooltip = d3
            .select('#content2')
            .append('div')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('border-radius', '5px')
            .style('position', 'absolute')
            .style('class', 'tooltip')
            .style('padding', '10px')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('z-index', '100')

        // Add event handlers
        rectangle
            .on('mouseover', function (event: any) {
                tooltip.style('opacity', 1)
                tooltip.html(details)
                tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 35 + 'px')
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0)
            })
            .on('click', () => {
                d3.selectAll('.gene').attr('fill', c).style('opacity', 0.7)

                const seq = d3.selectAll('.' + geneRename)
                seq.attr('fill', '#2D929B').style('opacity', 1)
                this.geneClicked.emit(geneName)
            })
    }

    handleData() {
        this.dataService.fetchData().then(data => {
            let squareWidth = this.squareWidth
            let compressionNum = this.compressionNum
            let scaffold = this.scaffold
            let squareHeight = squareWidth
            let width = 1000
            if (this.width) {
                squareWidth <= 5
                    ? (width = this.width - 10 * 10)
                    : (width = this.width - 10 * squareWidth)
            }
            let margin = { top: 20, right: 30, bottom: 60, left: 90 }

            // console.log('scaffold:' + scaffold)

            // gene's location
            let X = 0
            let Y = squareWidth + 10
            let yAdd = squareWidth * 2

            // colors
            let genomeColorL1 = '#0fa3b1'
            let variantColor = d3
                .scaleLinear()
                .domain([1, 0])
                .range(['#c02425', '#EDC534'] as any)
            let comColor = '#adb5bd'

            // mutation circle size
            let muRadius = squareWidth * 2

            let svgWidth = width + 5 * squareWidth

            if (squareWidth <= 5) {
                svgWidth += 50
            }

            let svg = d3
                .select('#content2')
                .append('svg')
                .attr('width', svgWidth)
                .attr('transform', `translate(${margin.left - 60},${margin.top})`)

            let lastPosition = 0
            let endSquare = false
            const drawMutation = (mutation: any) => {
                this.drawCircle(
                    svg,
                    X,
                    Y + squareWidth * 0.5,
                    muRadius * mutation.muValues,
                    variantColor(mutation.muValues),
                    mutation.muValues,
                    `BP: ${mutation.BP}<br>Mutation degree: ${mutation.muValues}<br>Ref: ${mutation.pRef}<br>P Nuc: ${mutation.pNuc}`
                )
                X += 2
                if (X + squareWidth > width) {
                    Y += yAdd
                    X = 0
                }
            }

            const geneCompress = (
                start: number,
                end: number,
                isGene: boolean,
                geneName: string = ''
            ) => {
                let squareNum = Math.floor((end - start) / compressionNum)
                let squareRemain = Math.floor((end - start) % compressionNum)
                if ((squareNum === 0 && squareRemain > 0) || squareRemain > 0) squareNum += 1
                let last = false
                // lastPosition++
                if (squareRemain < 0) {
                    console.log('SquareRemain:' + squareRemain)
                    console.log('SquareNum:' + squareNum)
                    console.log('Start:' + start)
                    console.log('End:' + end)
                    console.log('GeneName:' + geneName)
                    console.log('lastPosistion:' + lastPosition)
                }
                for (let k = 0; k < squareNum; k++) {
                    if (k == squareNum - 1 && squareRemain) {
                        lastPosition += squareRemain
                    } else {
                        lastPosition += compressionNum
                    }

                    // If the last square, set last to true
                    if (
                        (X + squareWidth <= width && X + squareWidth * 2 > width) ||
                        (endSquare && k === squareNum - 1)
                    ) {
                        last = true
                    }

                    if (X + squareWidth > width) {
                        Y += yAdd
                        X = 0
                    }

                    if (squareWidth < 5) {
                        svg.attr('height', Y + 10)
                    } else {
                        svg.attr('height', Y + squareWidth + 10)
                    }

                    if (isGene) {
                        this.drawGeneRectangle(
                            svg,
                            X,
                            Y,
                            squareWidth,
                            squareHeight,
                            genomeColorL1,
                            `Gene: ${geneName} &nbsp Start: ${start} &nbsp End: ${end}`,
                            last,
                            lastPosition,
                            geneName
                        )
                    } else {
                        this.drawRectangle(
                            svg,
                            X,
                            Y,
                            squareWidth,
                            squareHeight,
                            comColor,
                            last,
                            lastPosition
                        )
                    }

                    X += squareWidth
                    last = false
                }
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i].chromosome !== scaffold) continue

                let lastGene = data[i].gene.length - 1
                let muInLastGene = false
                let mutations = data[i].mutation

                // Enter selected scaffold
                for (let g = 0; g < data[i].gene.length; g++) {
                    let gene = data[i].gene[g]
                    let previousPoint = g === 0 ? 0 : data[i].gene[g - 1].end
                    let hasMutation = false
                    // let mChange = false
                    // let mChangeTime = 0

                    // No mutation in the scaffold
                    if (mutations.length === 0) {
                        if (previousPoint > gene.start) {
                            geneCompress(previousPoint, gene.end, true, gene.name)
                        }
                        geneCompress(previousPoint, gene.start, false, '')
                        geneCompress(gene.start, gene.end, true, gene.name)
                        continue
                    }

                    // Mutation in the scaffold
                    for (let m = 0; m < mutations.length; m++) {
                        let start = gene.start

                        // among previous gene end and current gene start
                        if (mutations[m].BP > previousPoint && mutations[m].BP < start) {
                            geneCompress(previousPoint, mutations[m].BP, false, '')
                            drawMutation(mutations[m])

                            while (m + 1 < mutations.length && mutations[m + 1].BP < start) {
                                m++
                                geneCompress(mutations[m - 1].BP, mutations[m].BP, false, '')
                                drawMutation(mutations[m])
                            }

                            geneCompress(mutations[m].BP, start, false, '')
                            hasMutation = true
                            if (
                                (m + 1 < mutations.length && mutations[m + 1].BP > gene.end) ||
                                m + 1 >= mutations.length
                            ) {
                                geneCompress(start, gene.end, true, gene.name)
                            }
                        }

                        // among current gene start and end
                        if (mutations[m].BP >= start && mutations[m].BP <= gene.end) {
                            // current gene start is smaller than previous point
                            if (previousPoint > start) {
                                start = previousPoint
                            } else if (!hasMutation) {
                                geneCompress(previousPoint, start, false, '')
                            }

                            if (mutations[m].BP === start) {
                                drawMutation(mutations[m])

                                while (m + 1 < mutations.length && mutations[m + 1].BP === start) {
                                    m++
                                    drawMutation(mutations[m])
                                    // mChange = true
                                    // mChangeTime++
                                }
                            }

                            if (mutations[m].BP > start && mutations[m].BP < gene.end) {
                                geneCompress(start, mutations[m].BP, true, gene.name)
                                drawMutation(mutations[m])

                                while (
                                    m + 1 < mutations.length &&
                                    mutations[m + 1].BP > start &&
                                    mutations[m + 1].BP < gene.end
                                ) {
                                    m++
                                    geneCompress(
                                        mutations[m - 1].BP,
                                        mutations[m].BP,
                                        true,
                                        gene.name
                                    )
                                    drawMutation(mutations[m])
                                    // mChange = true
                                    // mChangeTime++
                                }
                            }

                            // if (!mChange) {
                            geneCompress(mutations[m].BP, gene.end, true, gene.name)
                            // } else {
                            //     geneCompress(
                            //         mutations[m - mChangeTime].BP,
                            //         gene.end,
                            //         true,
                            //         gene.name
                            //     )
                            // }

                            if (mutations[m].BP === gene.end) {
                                drawMutation(mutations[m])
                                // multiMutation()
                                while (
                                    m + 1 < mutations.length &&
                                    mutations[m + 1].BP === gene.end
                                ) {
                                    m++
                                    drawMutation(mutations[m])
                                }
                            }

                            hasMutation = true
                        }

                        // mutation is among the last gene end and scaffold end
                        if (g === lastGene && mutations[m].BP > gene.end) {
                            geneCompress(gene.end, mutations[m].BP, false, '')
                            drawMutation(mutations[m])
                            while (m + 1 < mutations.length && mutations[m].BP > gene.end) {
                                m++
                                geneCompress(mutations[m - 1].BP, mutations[m].BP, false, '')
                                drawMutation(mutations[m])
                            }
                            endSquare = true
                            hasMutation = true
                            muInLastGene = true
                            geneCompress(mutations[m].BP, data[i].length, false, '')
                        }
                    }

                    if (!hasMutation) {
                        if (previousPoint > gene.start) {
                            geneCompress(previousPoint, gene.end, true, gene.name)
                        } else {
                            geneCompress(previousPoint, gene.start, false, '')
                            if (gene.end === data[i].length) {
                                endSquare = true
                            }
                            geneCompress(gene.start, gene.end, true, gene.name)
                        }
                    }
                }

                // The last compression
                if (data[i].gene[lastGene].end < data[i].length) {
                    endSquare = true
                    if (!muInLastGene) {
                        geneCompress(data[i].gene[lastGene].end, data[i].length, false, '')
                    }
                }
            }
        })
    }
}
