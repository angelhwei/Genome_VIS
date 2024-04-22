import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
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
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ThemePalette } from '@angular/material/core'
import { SequenceExpressionService } from '../../../../services/sequence-expression.service'
import { merge } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'


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
        CommonModule,
    ],
    templateUrl: './scaffold-sequence.component.html',
    styleUrl: './scaffold-sequence.component.scss',
})
export class ScaffoldSequenceComponent {
    @Input() width!: number
    @Output() geneClicked = new EventEmitter<string>()

    @ViewChild('content2') content2!: ElementRef;

    squareSize = new FormControl('', [Validators.required, Validators.min(1), Validators.max(30)])
    squareCompress = new FormControl('', [
        Validators.required,
        Validators.min(100),
        Validators.max(10000),
    ])

    errorMessage = ''
    colorControl = new FormControl('warn' as ThemePalette)
    squareWidth: number = 10
    compressionNum: number = 1000
    scaffold!: string
    data: any

    constructor(
        private shareService: ShareService,
        private dataService: DataService,
        private sequenceExpr: SequenceExpressionService
    ) {
        merge(
            this.squareSize.statusChanges,
            this.squareSize.valueChanges,
            this.squareCompress.statusChanges,
            this.squareCompress.valueChanges
        )
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage())
    }

    ngOnInit() {
        this.shareService.currentData.subscribe(data => {
            if (data) {
                this.scaffold = data.scaffold
                this.handleData()
            }
        })
    }

    updateErrorMessage() {
        if (this.squareSize.hasError('required') || this.squareCompress.hasError('required')) {
            this.errorMessage = 'You must enter a value'
        } else if (
            this.squareSize.hasError('min') ||
            this.squareSize.hasError('max') ||
            this.squareCompress.hasError('min') ||
            this.squareCompress.hasError('max')
        ) {
            this.errorMessage = 'Not a valid number'
        } else {
            this.errorMessage = ''
        }
    }

    handleClick() {
        d3.select('#content2').text('')
        this.handleData()
    }

    drawCircle(
        svg: any,
        x: number,
        y: number,
        radius: number,
        c: any,
        squareWidth: any,
        details: string
    ) {
        squareWidth < 5 ? (radius *= 2) : (radius = radius)
        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', squareWidth / 3)
            .attr('fill', c)
            .style('opacity', 0.9)
            .style('stroke', 'none')
            .style('z-index', '100')
            .raise()

        const circle = svg
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', radius)
            .attr('fill', c)
            .style('opacity', 0.5)
            .style('stroke', 'none') // Initially, no stroke
            .attr('cursor', 'pointer')
            .raise()

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

        let tooltipWidth = 200 // Replace with your tooltip width
        let tooltipHeight = 80
        let container = d3.select('#content2') // Replace with your container selector
        let containerNode = container.node() as Element
        let containerRect = containerNode ? containerNode.getBoundingClientRect() : null

        circle
            .on('mouseover', (event: any) => {
                tooltip.style('opacity', 1)
                tooltip
                    .html(details)
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
                            return pageX - tooltipWidth + 220 + 'px'
                        }
                    })

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
        const rectangle = svg
            .append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', w)
            .attr('height', h)
            .attr('fill', c)
            .style('opacity', 0.7)

        rectangle.lower()

        if (last) {
            const fontSize = w <= 5 ? 10 : w
            const textElement = svg
                .append('text')
                .attr('x', x + w * 1.5)
                .attr('y', y + h)
                .text(lastPosition)
                .style('font-size', h)

            const handleMouseOverOut = (event: any, size: number) => {
                if (w <= 5) {
                    d3.select(event.target).style('font-size', size)
                }
            }

            textElement
                .on('mouseover', (event: any) => handleMouseOverOut(event, fontSize))
                .on('mouseout', (event: any) => handleMouseOverOut(event, h))
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
            .style('opacity', 0.6)
            .attr('cursor', 'pointer')

        rectangle.lower()

        if (last) {
            const handleMouseEvents = (event: any, size: number) => {
                if (w <= 5) {
                    d3.select(event.target).style('font-size', size)
                }
            }

            svg.append('text')
                .attr('x', x + w * 1.5)
                .attr('y', y + h)
                .text(lastPosition)
                .style('font-size', h)
                .on('mouseover', (event: any) => handleMouseEvents(event, 10))
                .on('mouseout', (event: any) => handleMouseEvents(event, h))
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

        rectangle
            .on('mouseover', (event: any) => {
                tooltip.style('opacity', 1)
                tooltip.html(details)
                tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 35 + 'px')

                const seq = d3.selectAll('.' + geneRename)
                seq.attr('fill', 'rgba(192,36,37,0.5)').style('opacity', 1)

                this.sequenceExpr.changeData(geneName)
                // this.geneClicked.emit(geneName)
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0)
                d3.selectAll('.gene').attr('fill', c).style('opacity', 0.6)
            })
    }

    handleData() {
        this.dataService.fetchData().then(data => {
            let squareWidth = this.squareWidth
            let compressionNum = this.compressionNum
            let scaffold = this.scaffold
            let squareHeight = squareWidth
            let margin = { top: 20, right: 30, bottom: 60, left: 90 }
            let width = this.width
                ? squareWidth <= 5
                    ? this.width - 10 * 10
                    : this.width - 10 * squareWidth
                : 1000

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
            let muRadius = squareWidth * 1.6

            let svgWidth = width + 5 * squareWidth
            squareWidth <= 5 ? (svgWidth += 50) : (svgWidth += 0)

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
                    muRadius * (mutation.muValues < 0.3 ? 0.3 : mutation.muValues),
                    variantColor(mutation.muValues),
                    squareWidth,
                    `BP: ${mutation.BP}<br>Mutation degree: ${mutation.muValues}<br>Ref: ${mutation.pRef}<br>P Nuc: ${mutation.pNuc}`
                )
            }

            const geneCompress = (
                start: number,
                end: number,
                isGene: boolean,
                geneName: string = '',
                geneStart: number = 0,
                geneEnd: number = 0,
                overlap: number = 0
            ) => {
                console.log('overlap:', overlap)
                let squareNum = Math.ceil((end - start) / compressionNum)
                let squareRemain = Math.floor((end - start) % compressionNum) - overlap
                // if ((squareNum === 0 && squareRemain > 0) || squareRemain > 0) squareNum += 1
                let last = false

                // error checking
                if (squareRemain < 0) {
                    console.log('SquareRemain:' + squareRemain)
                    console.log('SquareNum:' + squareNum)
                    console.log('Start:' + start)
                    console.log('End:' + end)
                    console.log('GeneName:' + geneName)
                    console.log('lastPosistion:' + lastPosition)
                }

                for (let k = 0; k < squareNum; k++) {
                    k == squareNum - 1 && squareRemain
                        ? (lastPosition += squareRemain)
                        : (lastPosition += compressionNum)

                    // If the last square, set last to true
                    ;(X + squareWidth <= width && X + squareWidth * 2 > width) ||
                    (endSquare && k === squareNum - 1)
                        ? (last = true)
                        : (last = false)

                    if (X + squareWidth > width) (Y += yAdd), (X = 0)

                    svg.attr('height', squareWidth < 5 ? Y + 10 : Y + squareWidth + 10)

                    isGene
                        ? this.drawGeneRectangle(
                              svg,
                              X,
                              Y,
                              squareWidth,
                              squareHeight,
                              genomeColorL1,
                              `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                              last,
                              lastPosition,
                              geneName
                          )
                        : this.drawRectangle(
                              svg,
                              X,
                              Y,
                              squareWidth,
                              squareHeight,
                              comColor,
                              last,
                              lastPosition
                          )

                    X += squareWidth
                    last = false
                }

                // let sequenceWidth = squareNum * squareWidth
                // svg.attr('height', squareWidth < 5 ? Y + 10 : Y + squareWidth + 10)
                // if (X + sequenceWidth + squareWidth < width) {
                //     endSquare ? (last = true) : (last = false)
                //     squareRemain
                //         ? (lastPosition += (squareNum - 1) * compressionNum + squareRemain)
                //         : (lastPosition += squareNum * compressionNum)

                //     isGene
                //         ? this.drawGeneRectangle(
                //               svg,
                //               X,
                //               Y,
                //               sequenceWidth,
                //               squareHeight,
                //               genomeColorL1,
                //               `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                //               last,
                //               lastPosition,
                //               geneName
                //           )
                //         : this.drawRectangle(
                //               svg,
                //               X,
                //               Y,
                //               sequenceWidth,
                //               squareHeight,
                //               comColor,
                //               last,
                //               lastPosition
                //           )
                //     X += sequenceWidth
                // }
                // while (X + sequenceWidth + squareWidth > width) {
                //     lastPosition += ((width - X) / squareWidth) * compressionNum
                //     last = true
                //     isGene
                //         ? this.drawGeneRectangle(
                //               svg,
                //               X,
                //               Y,
                //               width - X,
                //               squareHeight,
                //               genomeColorL1,
                //               `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                //               last,
                //               lastPosition,
                //               geneName
                //           )
                //         : this.drawRectangle(
                //               svg,
                //               X,
                //               Y,
                //               width - X,
                //               squareHeight,
                //               comColor,
                //               last,
                //               lastPosition
                //           )
                //     X = 0
                //     Y += yAdd
                //     sequenceWidth -= width - X
                // }
                // if (sequenceWidth > 0) {
                //     X + sequenceWidth + sequenceWidth == width || endSquare
                //         ? (last = true)
                //         : (last = false)
                //     squareRemain
                //         ? (lastPosition +=
                //               (sequenceWidth / squareWidth - 1) * compressionNum + squareRemain)
                //         : (lastPosition += (sequenceWidth / squareWidth) * compressionNum)

                //     isGene
                //         ? this.drawGeneRectangle(
                //               svg,
                //               X,
                //               Y,
                //               sequenceWidth,
                //               squareHeight,
                //               genomeColorL1,
                //               `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                //               last,
                //               lastPosition,
                //               geneName
                //           )
                //         : this.drawRectangle(
                //               svg,
                //               X,
                //               Y,
                //               sequenceWidth,
                //               squareHeight,
                //               comColor,
                //               last,
                //               lastPosition
                //           )
                //     X += sequenceWidth
                // }
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i].chromosome !== scaffold) continue

                let lastGene = data[i].gene.length - 1
                let muInLastGene = false
                let mutations = data[i].mutation
                let geneHasMutation = [] as any
                let preEnd = 0

                // Enter selected scaffold
                for (let g = 0; g < data[i].gene.length; g++) {
                    let gene = data[i].gene[g]
                    let previousPoint = g === 0 ? 0 : data[i].gene[g - 1].end
                    if (preEnd) {
                        previousPoint = preEnd
                        preEnd = 0
                    }
                    let hasMutation = false
                    let overlapping = 0

                    // No mutation in the scaffold
                    if (mutations.length === 0) {
                        if (previousPoint > gene.start) {
                            let previousG = 0
                            while (
                                g - previousG > 0 &&
                                data[i].gene[g - (previousG + 1)].end > gene.start
                            ) {
                                previousG++
                            }
                            previousPoint = data[i].gene[g - previousG].end
                            if (previousPoint > gene.end) {
                                overlapping = gene.end - gene.start
                                preEnd = previousPoint
                            } else overlapping = previousPoint - gene.start

                            X -=
                                Math.ceil((previousPoint - gene.start) / compressionNum) *
                                squareWidth
                            while (X < 0) {
                                X = width
                                Y -= yAdd
                            }

                            geneCompress(
                                gene.start,
                                gene.end,
                                true,
                                gene.name,
                                gene.start,
                                gene.end,
                                overlapping
                            )
                        } else {
                            geneCompress(previousPoint, gene.start, false)
                            if (gene.end === data[i].length) {
                                endSquare = true
                            }
                            geneCompress(
                                gene.start,
                                gene.end,
                                true,
                                gene.name,
                                gene.start,
                                gene.end
                            )
                        }
                        continue
                    }

                    // Mutation in the scaffold
                    for (let m = 0; m < mutations.length; m++) {
                        let start = gene.start

                        // Among previous gene end and current gene start
                        if (mutations[m].BP > previousPoint && mutations[m].BP < start) {
                            geneCompress(previousPoint, mutations[m].BP, false)
                            drawMutation(mutations[m])

                            while (m + 1 < mutations.length && mutations[m + 1].BP < start) {
                                m++
                                geneCompress(mutations[m - 1].BP, mutations[m].BP, false)
                                drawMutation(mutations[m])
                            }

                            geneCompress(mutations[m].BP, start, false)
                            hasMutation = true

                            // If next mutation is not in the current gene or no more mutation
                            if (
                                (m + 1 < mutations.length && mutations[m + 1].BP > gene.end) ||
                                m + 1 >= mutations.length
                            ) {
                                geneCompress(start, gene.end, true, gene.name, gene.start, gene.end)
                            }
                        }

                        // Among current gene start and end
                        if (mutations[m].BP >= start && mutations[m].BP <= gene.end) {
                            // current gene start is smaller than previous point
                            if (previousPoint > start) {
                                let previousG = 0
                                while (
                                    g - previousG > 0 &&
                                    data[i].gene[g - (previousG + 1)].end > gene.start
                                ) {
                                    previousG++
                                }
                                previousPoint = data[i].gene[g - previousG].end
                                if (previousPoint > gene.end) {
                                    overlapping = gene.end - gene.start
                                    preEnd = previousPoint
                                } else overlapping = previousPoint - gene.start

                                X -=
                                    Math.ceil((previousPoint - gene.start) / compressionNum) *
                                    squareWidth
                                while (X < 0) {
                                    X = width
                                    Y -= yAdd
                                }
                            } else if (!hasMutation) {
                                geneCompress(previousPoint, start, false)
                            }

                            // Mutation is at the start point
                            if (mutations[m].BP === start) {
                                drawMutation(mutations[m])

                                while (m + 1 < mutations.length && mutations[m + 1].BP === start) {
                                    m++
                                    drawMutation(mutations[m])
                                    // mChange = true
                                    // mChangeTime++
                                }
                            }

                            // Mutation is among the gene start and end
                            if (mutations[m].BP > start && mutations[m].BP < gene.end) {
                                geneCompress(
                                    start,
                                    mutations[m].BP,
                                    true,
                                    gene.name,
                                    gene.start,
                                    gene.end
                                )
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
                                        gene.name,
                                        gene.start,
                                        gene.end
                                    )
                                    drawMutation(mutations[m])
                                }
                            }

                            geneCompress(
                                mutations[m].BP,
                                gene.end,
                                true,
                                gene.name,
                                gene.start,
                                gene.end,
                                overlapping
                            )

                            // Mutation is at the end point
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
                            if (geneHasMutation.includes(gene.name) === false) {
                                geneHasMutation.push(gene.name)
                            }
                        }

                        // mutation is among the last gene end and scaffold end
                        if (g === lastGene && mutations[m].BP > gene.end) {
                            geneCompress(gene.end, mutations[m].BP, false)
                            drawMutation(mutations[m])
                            while (m + 1 < mutations.length && mutations[m].BP > gene.end) {
                                m++
                                geneCompress(mutations[m - 1].BP, mutations[m].BP, false)
                                drawMutation(mutations[m])
                            }
                            endSquare = true
                            hasMutation = true
                            muInLastGene = true
                            geneCompress(mutations[m].BP, data[i].length, false)
                        }
                    }

                    // Current gene do not have mutation
                    if (!hasMutation) {
                        if (previousPoint > gene.start) {
                            let previousG = 0
                            while (
                                g - previousG > 0 &&
                                data[i].gene[g - (previousG + 1)].end > gene.start
                            ) {
                                previousG++
                            }
                            previousPoint = data[i].gene[g - previousG].end
                            if (previousPoint > gene.end) {
                                overlapping = gene.end - gene.start
                                preEnd = previousPoint
                            } else overlapping = previousPoint - gene.start

                            X -=
                                Math.ceil((previousPoint - gene.start) / compressionNum) *
                                squareWidth
                            while (X < 0) {
                                X = width
                                Y -= yAdd
                            }

                            geneCompress(
                                gene.start,
                                gene.end,
                                true,
                                gene.name,
                                gene.start,
                                gene.end,
                                overlapping
                            )
                        } else {
                            geneCompress(previousPoint, gene.start, false)
                            if (gene.end === data[i].length) {
                                endSquare = true
                            }
                            geneCompress(
                                gene.start,
                                gene.end,
                                true,
                                gene.name,
                                gene.start,
                                gene.end
                            )
                        }
                    }
                }

                // The last compression
                if (data[i].gene[lastGene].end < data[i].length) {
                    endSquare = true
                    if (!muInLastGene) {
                        geneCompress(data[i].gene[lastGene].end, data[i].length, false)
                    }
                }
                this.sequenceExpr.geneHasMu(geneHasMutation)
            }
        })
    }
}
