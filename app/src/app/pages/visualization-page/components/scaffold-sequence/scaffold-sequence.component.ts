import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as d3 from 'd3'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatNativeDateModule } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ShareService } from '@services/share.service'
import { DataService } from '@services/data.service'
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ThemePalette } from '@angular/material/core'
import { SequenceExpressionService } from '@services/sequence-expression.service'
import { merge } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { GeneExpDataService } from '@services/gene-exp-data.service'
import { isPlatformBrowser } from '@angular/common';

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
        MatSlideToggleModule,
        MatCheckboxModule,
    ],
    templateUrl: './scaffold-sequence.component.html',
    styleUrl: './scaffold-sequence.component.scss',
})
export class ScaffoldSequenceComponent {
    @Input() width!: number
    @Input() pcAxisNum!: number
    @Output() geneClicked = new EventEmitter<string>()
    @ViewChild('content2') content2!: ElementRef

    squareSize = new FormControl('', [Validators.required, Validators.min(1), Validators.max(30)])
    squareCompress = new FormControl('', [
        Validators.required,
        Validators.min(100),
        Validators.max(10000),
    ])

    data: any
    errorMessage = ''
    colorControl = new FormControl('warn' as ThemePalette)
    squareWidth: number = 10
    compressionNum: number = 1000
    scaffold!: string
    geneHasMu: string[] = []
    highlight = false
    expGeneData: string[] = []
    geneInExpData: string[] = []

    constructor(
        private shareService: ShareService,
        private dataService: DataService,
        private sequenceExpr: SequenceExpressionService,
        private geneExpDataService: GeneExpDataService,
        @Inject(PLATFORM_ID) private platformId: Object
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
      if (isPlatformBrowser(this.platformId)) {
        this.shareService.currentData.subscribe(data => {
            if (data) {
                this.scaffold = data.scaffold
                this.handleData()
            }
        })
        this.geneExpDataService.fetchGeneExpData().subscribe(data => {
            this.expGeneData = data.map((d: any) => d.Gene)
        })
      }
    }

    geneInExp(genes: any) {
        for (let d of genes.gene) {
            if (this.expGeneData.includes(d.name)) {
                this.geneInExpData.push(d.name)
            }
        }
        console.log(this.geneInExpData)
    }

    showGeneHasMu(completed: boolean) {
        let geneRename = ''
        if (completed && this.geneHasMu.length > 0) {
            this.geneHasMu.forEach((gene: string) => {
                geneRename = 'seq-' + gene.replace(/[^\w\s]|_/g, '').toLowerCase()
                d3.selectAll('.' + geneRename).style('fill', 'rgba(192,36,37,0.5)')
            })
            this.highlight = true
        } else {
            this.geneHasMu.forEach((gene: string) => {
                // geneRename = 'seq-' + gene.replace(/[^\w\s]|_/g, '').toLowerCase()
                d3.selectAll('.gene').style('fill', '#0fa3b1')
            })
            this.highlight = false
        }
    }

    updateErrorMessage() {
        if (
            this.squareSize.hasError('min') ||
            this.squareSize.hasError('max') ||
            this.squareCompress.hasError('min') ||
            this.squareCompress.hasError('max')
        ) {
            this.errorMessage = 'Not a valid number'
        } else {
            this.errorMessage = 'Wrong number'
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
            .style('background-color', c)
            .style('color', '#fff')
            .style('border-radius', '5px')
            .style('position', 'absolute')
            .style('class', 'tooltip')
            .style('padding', '10px')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('z-index', '100')

        let tooltipWidth = 200 // Replace with your tooltip width
        let tooltipHeight = 80
        let container = d3.select('#content2') // Replace with your container selector
        let containerNode = container.node() as Element
        let containerRect = containerNode ? containerNode.getBoundingClientRect() : null

        circle
            .on('mouseover', (event: any) => {
                tooltip.style('opacity', 0.9)
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

                d3.select(event.target).style('stroke', 'red').style('stroke-width', '3px')
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
            const handleMouseOverOut = (event: any, size: number) => {
                if (w <= 5) {
                    d3.select(event.target).style('font-size', size)
                }
            }

            svg.append('text')
                .attr('x', x + w + 5)
                .attr('y', y + h)
                .text(Math.floor(lastPosition))
                .style('font-size', h)
                .attr('cursor', 'default')
                .on('mouseover', (event: any) => handleMouseOverOut(event, 10))
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
        geneName: string,
        overlap: number = 0
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
                .attr('x', x + w + 5)
                .attr('y', y + h)
                .text(Math.floor(lastPosition))
                .style('font-size', h)
                .attr('cursor', 'default')
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
                seq.style('opacity', 1)

                if (this.pcAxisNum > 1) {
                    if (!this.geneInExpData.includes(geneName)) {
                        const geneInExptooltip = d3
                            .select('#pc-container')
                            .style('position', 'relative')
                            .append('div')
                            .attr('class', 'geneInExptooltip')
                            .style('background-color', 'rgba(192,36,37,0.8)')
                            .style('color', '#fff')
                            .style('border-radius', '5px')
                            .style('padding', '10px')
                            .html('No differential expression')
                            .style('position', 'absolute')
                            .style('opacity', 1)
                            .style('top', '10%')
                            .style('left', '50%')
                            .style('transform', 'translate(-50%, -50%)')
                    }
                }
                this.sequenceExpr.changeData(geneName)
                // this.geneClicked.emit(geneName)
            })
            .on('mouseout', (event: any) => {
                tooltip.style('opacity', 0)
                d3.selectAll('.gene').style('opacity', 0.6)
                if (this.pcAxisNum > 1) {
                    d3.selectAll('.geneInExptooltip').style('opacity', 0)
                    d3.select('#pc-container').style('position', 'static')
                }
            })
    }

    handleData() {
        this.dataService.fetchData().subscribe(data => {
            data = data.filter((d: any) => d.chromosome == this.scaffold)[0]
            console.log("data:", data)
            this.geneInExp(data)
            let squareWidth = this.squareWidth
            let compressionNum = this.compressionNum
            let squareHeight = squareWidth
            let margin = { top: 10, right: 30, bottom: 60, left: 90 }
            let width = 1000

            if (this.width) {
                if (squareWidth <= 6) {
                    width = this.width - margin.bottom - margin.top
                } else if (squareWidth > 6 && squareWidth <= 14) {
                    width = this.width - margin.top * squareWidth
                } else if (squareWidth >= 15 && squareWidth <= 20) {
                    width = this.width - margin.top * 2 - margin.bottom - squareWidth * 2.5
                } else if (squareWidth >= 21 && squareWidth <= 24) {
                    width = this.width - margin.top * 2 - margin.bottom - squareWidth * 3
                } else if (squareWidth >= 25 && squareWidth <= 30) {
                    width = this.width - margin.top * 3 - margin.bottom - squareWidth * 3.5
                }
            }

            width = (width/squareWidth) * squareWidth

            // gene's location
            let X = 0
            let Y = squareWidth + 10
            let yAdd = squareWidth * 2

            // square color
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
                let squareNum = Math.ceil((end - start) / compressionNum)
                let squareRemain = Math.floor((end - start) % compressionNum) - overlap
                let last = false

                // // error checking
                // // if (squareRemain < 0) {
                // //     console.log('SquareRemain:' + squareRemain)
                // //     console.log('SquareNum:' + squareNum)
                // //     console.log('Start:' + start)
                // //     console.log('End:' + end)
                // //     console.log('GeneName:' + geneName)
                // //     console.log('lastPosistion:' + lastPosition)
                // // }

                // for (let k = 0; k < squareNum; k++) {
                //     k == squareNum - 1 && squareRemain
                //         ? (lastPosition += squareRemain)
                //         : (lastPosition += compressionNum)

                //     // If the last square, set last to true
                //     ;(X + squareWidth <= width && X + squareWidth * 2 > width) ||
                //     (endSquare && k === squareNum - 1)
                //         ? (last = true)
                //         : (last = false)

                //     if (X + squareWidth > width) (Y += yAdd), (X = 0)

                //     isGene
                //         ? this.drawGeneRectangle(
                //               svg,
                //               X,
                //               Y,
                //               squareWidth,
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
                //               squareWidth,
                //               squareHeight,
                //               comColor,
                //               last,
                //               lastPosition
                //           )

                //     X += squareWidth
                // }
                // svg.attr('height', squareWidth < 5 ? Y + margin.top : Y + squareWidth + margin.top)

                let sequenceWidth = squareNum * squareWidth // Current sequence width
                svg.attr(
                    'height',
                    squareWidth < 5 ? Y + margin.top : Y + squareWidth ** 2 + margin.top
                )

                // NOTE: Optimized code

                if (X + sequenceWidth < width) {
                    endSquare ? (last = true) : (last = false)
                    squareRemain
                        ? (lastPosition += (squareNum - 1) * compressionNum + squareRemain)
                        : (lastPosition += squareNum * compressionNum)

                    isGene
                        ? this.drawGeneRectangle(
                              svg,
                              X,
                              Y,
                              sequenceWidth,
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
                              sequenceWidth,
                              squareHeight,
                              comColor,
                              last,
                              lastPosition
                          )
                    X += sequenceWidth
                    return
                }
                while (X + sequenceWidth > width) {
                    lastPosition += ((width - X) / squareWidth) * compressionNum
                    last = true
                    isGene
                        ? this.drawGeneRectangle(
                              svg,
                              X,
                              Y,
                              width - X,
                              squareHeight,
                              genomeColorL1,
                              `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                              last,
                              lastPosition,
                              geneName,
                              overlap
                          )
                        : this.drawRectangle(
                              svg,
                              X,
                              Y,
                              width - X,
                              squareHeight,
                              comColor,
                              last,
                              lastPosition
                          )

                    sequenceWidth = sequenceWidth - (width - X)
                    X = 0
                    Y += yAdd
                }
                if (sequenceWidth > 0) {
                    X + sequenceWidth == width || endSquare ? (last = true) : (last = false)
                    squareRemain
                        ? (lastPosition +=
                              (sequenceWidth / squareWidth - 1) * compressionNum + squareRemain)
                        : (lastPosition += (sequenceWidth / squareWidth) * compressionNum)

                    isGene
                        ? this.drawGeneRectangle(
                              svg,
                              X,
                              Y,
                              sequenceWidth,
                              squareHeight,
                              genomeColorL1,
                              `Gene: ${geneName} &nbsp Start: ${geneStart} &nbsp End: ${geneEnd}`,
                              last,
                              lastPosition,
                              geneName,
                              overlap
                          )
                        : this.drawRectangle(
                              svg,
                              X,
                              Y,
                              sequenceWidth,
                              squareHeight,
                              comColor,
                              last,
                              lastPosition
                          )
                    X += sequenceWidth
                }
            }

            let lastGene = data.gene.length - 1
            let muInLastGene = false
            let mutations = data.mutation
            let geneHasMutation = [] as any
            let preEnd = 0 // if overlapping happened before N previous gene
            let currentX = 0 // recorded current X position if have overlapping
            let currentY = 0 // recorded current Y position if have overlapping

            // Enter selected scaffold
            data.gene.forEach((gene: any, g: any) => {
                let previousPoint = g === 0 ? 0 : data.gene[g - 1].end
                if (preEnd) {
                    if (preEnd < gene.start) {
                        previousPoint = preEnd
                        X = currentX
                        Y = currentY
                        currentX = 0
                        currentY = 0
                    }
                    preEnd = 0
                }
                let hasMutation = false
                let overlapping = 0
                const overlappingCal = () => {
                    let previousG = 0
                    while (g - previousG > 0 && data.gene[g - (previousG + 1)].end > gene.start) {
                        previousG++
                    }
                    previousPoint = data.gene[g - previousG].end
                    if (previousPoint > gene.end) {
                        overlapping = gene.end - gene.start
                        preEnd = previousPoint
                    } else overlapping = previousPoint - gene.start

                    currentX = X
                    currentY = Y
                    X -= Math.ceil((previousPoint - gene.start) / compressionNum) * squareWidth
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
                }

                // No mutation in the scaffold
                if (mutations.length === 0) {
                    if (previousPoint > gene.start) {
                        overlappingCal()
                    } else {
                        geneCompress(previousPoint, gene.start, false)
                        if (gene.end === data.length) {
                            endSquare = true
                        }
                        geneCompress(gene.start, gene.end, true, gene.name, gene.start, gene.end)
                    }
                    return
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
                            overlappingCal()
                        } else if (!hasMutation) {
                            geneCompress(previousPoint, start, false)
                        }

                        // Mutation is at the start point
                        if (mutations[m].BP === start) {
                            drawMutation(mutations[m])
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
                        geneCompress(mutations[m].BP, data.length, false)
                    }
                }

                // Current gene do not have mutation
                if (!hasMutation) {
                    if (previousPoint > gene.start) {
                        overlappingCal()
                    } else {
                        geneCompress(previousPoint, gene.start, false)
                        if (gene.end === data.length) {
                            endSquare = true
                        }
                        geneCompress(gene.start, gene.end, true, gene.name, gene.start, gene.end)
                    }
                }
            })

            // The last compression
            if (data.gene[lastGene].end < data.length) {
                endSquare = true
                if (!muInLastGene) {
                    geneCompress(data.gene[lastGene].end, data.length, false)
                }
            }
            this.sequenceExpr.geneHasMu(geneHasMutation)
            this.geneHasMu = geneHasMutation
            if (this.highlight) this.showGeneHasMu(true)
        })
    }
}
