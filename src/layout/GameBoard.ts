import CONST from '../const/const'
import MatchManager from '../controller/MatchManager'
import ShuffleTiles from '../helper/ShuffleTiles'
import TweenHelper from '../helper/TweenHelper'
import Tile from '../objects/Tile'

class GameBoard extends Phaser.GameObjects.Container {
    private canMove: boolean
    private canDrag: boolean

    private tileGrid: (Tile | undefined)[][]
    private timeSinceInteraction: number
    private timeSinceIdle: number

    private firstSelectedTile: Tile | undefined
    private secondSelectedTile: Tile | undefined
    private currentSelectionImage: Phaser.GameObjects.Image | undefined
    private shuffleTiles: ShuffleTiles

    private isPlaying = true

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        this.timeSinceInteraction = 0
        this.timeSinceIdle = 0
        this.shuffleTiles = new ShuffleTiles(scene)
        this.scene.add.existing(this)
    }

    init(): void {
        this.canMove = true
        this.isPlaying = true

        this.tileGrid = []

        for (let y = CONST.gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < CONST.gridWidth; x++) {
                const image = this.scene.add
                    .image(x * CONST.tileWidth, y * CONST.tileHeight, 'ground')
                    .setOrigin(0)
                    .setScale(0.4)
                this.add(image)
            }
        }

        for (let y = CONST.gridHeight - 1; y >= 0; y--) {
            this.tileGrid[y] = []
            for (let x = 0; x < CONST.gridWidth; x++) {
                const tile = this.addTile(x, y)
                this.tileGrid[y][x] = tile
                this.shuffleTiles.addTile(tile)
            }
        }

        this.shuffleTiles.playSuffle(this.scene, () => {
            let count = CONST.gridWidth * CONST.gridHeight
            for (let y = CONST.gridHeight - 1; y >= 0; y--) {
                for (let x = 0; x < CONST.gridWidth; x++) {
                    const duration =
                        y * CONST.tileHeight + CONST.tileHeight * (CONST.gridHeight - y)
                    TweenHelper.moveTo(
                        this.scene,
                        this.tileGrid[y][x],
                        x * CONST.tileWidth,
                        y * CONST.tileHeight,
                        duration,
                        'Linear',
                        () => {
                            count--
                            if (count == 0) {
                                this.resetTimeHintAndIdle()
                                this.checkMatches()
                            }
                        }
                    )
                }
            }
        })

        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined

        this.scene.input.on('gameobjectdown', this.tileSelect, this)
        this.scene.input.on('pointermove', this.startSwipe, this)
        this.scene.input.on('pointerup', this.stopSwipe, this)
    }

    public async restart(): Promise<void> {
        return this.destroyAllTiles(() => {})
            .then(() => {
                this.init()
            })
            .then(() => {
                this.isPlaying = true
            })
    }

    public setIsPlaying(isPlaying: boolean): void {
        this.isPlaying = isPlaying
    }

    public preUpdate(time: number, delta: number): void {
        if (this.canMove) {
            this.timeSinceInteraction += delta
            this.timeSinceIdle += delta
            if (this.timeSinceInteraction >= CONST.delayShowIdle) {
                this.triggerIdle()
                this.timeSinceInteraction = 0
            }
            if (this.timeSinceIdle >= CONST.delayShowHint) {
                this.removeHint()
                this.showHint()
                this.timeSinceIdle = 0
            }
        }
    }

    private triggerIdle(): void {
        for (let y = 0; y < CONST.gridHeight; y++) {
            for (let x = 0; x < CONST.gridWidth; x++) {
                const tile = this.tileGrid[y][x]
                if (tile) {
                    this.scene.tweens.add({
                        targets: tile,
                        alpha: 0.5,
                        duration: 1000,
                        ease: 'Linear',
                        yoyo: true,
                        delay: x * 200,
                    })
                }
            }
        }
    }

    private removeIdleAnimations() {
        for (let y = 0; y < CONST.gridHeight; y++) {
            for (let x = 0; x < CONST.gridWidth; x++) {
                const tile = this.tileGrid[y][x]
                if (tile) {
                    this.scene.tweens.killTweensOf(tile)
                    tile.setAlpha(1)
                }
            }
        }
    }

    // Hint for showing
    private showHint(): void {
        let foundHint = false

        for (let y = 0; y < CONST.gridHeight; y++) {
            for (let x = 0; x < CONST.gridWidth; x++) {
                if (foundHint) {
                    return
                }

                if (x < CONST.gridWidth - 1) {
                    this.swapTilesInGrid(x, y, x + 1, y)

                    if (this.hasMatchAfterSwap()) {
                        this.highlightTile(x, y)
                        this.highlightTile(x + 1, y)

                        this.swapTilesInGrid(x, y, x + 1, y)
                        foundHint = true
                        continue
                    }

                    this.swapTilesInGrid(x, y, x + 1, y)
                }

                if (y < CONST.gridHeight - 1) {
                    this.swapTilesInGrid(x, y, x, y + 1)

                    if (this.hasMatchAfterSwap()) {
                        this.highlightTile(x, y)
                        this.highlightTile(x, y + 1)

                        this.swapTilesInGrid(x, y, x, y + 1)
                        foundHint = true
                        continue
                    }

                    this.swapTilesInGrid(x, y, x, y + 1)
                }
            }
        }

        if (!foundHint) {
            this.restart()
        }
    }

    private highlightTile(x: number, y: number): void {
        const tile = this.tileGrid[y][x]
        if (tile) {
            const image = this.scene.add.image(tile.x, tile.y, 'backgroundClick').setOrigin(0)
            tile.setData('selectionImage', image)
            this.add(image)
        }
    }

    private swapTilesInGrid(x1: number, y1: number, x2: number, y2: number): void {
        const temp = this.tileGrid[y1][x1]
        this.tileGrid[y1][x1] = this.tileGrid[y2][x2]
        this.tileGrid[y2][x2] = temp
    }

    private hasMatchAfterSwap(): boolean {
        const matches = this.getMatches(this.tileGrid)
        return matches.length > 0
    }

    private removeHint(): void {
        for (let y = 0; y < CONST.gridHeight; y++) {
            for (let x = 0; x < CONST.gridWidth; x++) {
                const tile = this.tileGrid[y][x]
                if (tile) {
                    const image = tile.getData('selectionImage')
                    if (image) {
                        image.destroy()
                        tile.setData('selectionImage', null)
                    }
                }
            }
        }
    }

    // Input for User
    private tileSelect(pointer: Phaser.Input.Pointer, tile: Tile) {
        if (this.canMove) {
            this.canDrag = true
            this.resetTimeHintAndIdle()
            this.removeIdleAnimations()
            this.removeHint()
            const y = tile.y / CONST.tileHeight
            const x = tile.x / CONST.tileWidth

            if (y >= CONST.gridHeight || x >= CONST.gridWidth || y < 0 || x < 0) return
            const pickeTile = this.tileGrid[y][x]
            if (pickeTile != undefined) {
                if (this.firstSelectedTile == undefined) {
                    this.firstSelectedTile = pickeTile
                    this.canMove = false
                    this.clickEffect(this.firstSelectedTile, () => {
                        this.canMove = true
                    })
                } else {
                    this.secondSelectedTile = pickeTile

                    if (this.firstSelectedTile == this.secondSelectedTile) {
                        this.tileUp()
                        return
                    } else {
                        const dx =
                            Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) /
                            CONST.tileWidth
                        const dy =
                            Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) /
                            CONST.tileHeight

                        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                            this.canMove = false
                            this.currentSelectionImage?.destroy()
                            this.currentSelectionImage = undefined
                            this.swapTiles()
                        } else {
                            this.tileUp()
                            this.firstSelectedTile = pickeTile
                            this.canMove = false
                            this.clickEffect(this.firstSelectedTile, () => {
                                this.canMove = true
                            })
                        }
                    }
                }
            }
        }
    }

    private startSwipe(pointer: Phaser.Input.Pointer) {
        if (this.canDrag && this.firstSelectedTile != undefined) {
            this.resetTimeHintAndIdle()
            const deltaX = pointer.downX - pointer.x
            const deltaY = pointer.downY - pointer.y
            let deltaRow = 0
            let deltaCol = 0

            if (
                deltaX > (CONST.tileWidth * CONST.scale) / 2 &&
                Math.abs(deltaY) < (CONST.tileWidth * CONST.scale) / 4
            ) {
                deltaCol = -1
            } else if (
                deltaX < (-CONST.tileWidth * CONST.scale) / 2 &&
                Math.abs(deltaY) < (CONST.tileWidth * CONST.scale) / 4
            ) {
                deltaCol = 1
            } else if (
                deltaY > (CONST.tileHeight * CONST.scale) / 2 &&
                Math.abs(deltaX) < (CONST.tileHeight * CONST.scale) / 4
            ) {
                deltaRow = -1
            } else if (
                deltaY < (-CONST.tileHeight * CONST.scale) / 2 &&
                Math.abs(deltaX) < (CONST.tileHeight * CONST.scale) / 4
            ) {
                deltaRow = 1
            }

            if (deltaRow !== 0 || deltaCol !== 0) {
                const currentRow = this.getTileRow(this.firstSelectedTile)
                const currentCol = this.getTileCol(this.firstSelectedTile)
                const targetRow = currentRow + deltaRow
                const targetCol = currentCol + deltaCol

                if (
                    targetRow >= 0 &&
                    targetRow < CONST.gridHeight &&
                    targetCol >= 0 &&
                    targetCol < CONST.gridWidth
                ) {
                    this.secondSelectedTile = this.tileGrid[targetRow][targetCol]
                    if (this.secondSelectedTile != undefined) {
                        this.currentSelectionImage?.destroy()
                        this.currentSelectionImage = undefined
                        this.swapTiles()
                        this.canDrag = false
                    }
                }
            }
        }
    }

    private stopSwipe() {
        this.canDrag = false
    }

    private getTileRow(tile: Tile) {
        return Math.floor(tile.y / CONST.tileHeight)
    }

    private getTileCol(tile: Tile) {
        return Math.floor(tile.x / CONST.tileWidth)
    }

    private clickEffect(tile: Tile, callBack?: Function | undefined): void {
        const centerX = tile.x
        const centerY = tile.y
        const newX = centerX - (CONST.tileWidth * 0.2) / 2
        const newY = centerY - (CONST.tileHeight * 0.2) / 2

        TweenHelper.clickToScale(
            this.scene,
            tile,
            newX,
            newY,
            1.2,
            1.2,
            200,
            'Linear',
            true,
            callBack
        )

        this.currentSelectionImage = this.scene.add
            .image(tile.x, tile.y, 'backgroundClick')
            .setOrigin(0)

        this.add(this.currentSelectionImage)
    }

    /**
     * Add a new random tile at the specified position.
     * @param x
     * @param y
     */
    private addTile(x: number, y: number): Tile {
        const randomTileType: string =
            CONST.candyTypes[Phaser.Math.RND.between(0, CONST.candyTypes.length - 1)]
        const tile = new Tile({
            scene: this.scene,
            x: x * CONST.tileWidth,
            y: y * CONST.tileHeight,
            texture: randomTileType,
        })
        this.add(tile)
        return tile
    }

    private swapTiles(): void {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            const firstTilePosition = {
                x: this.firstSelectedTile.x,
                y: this.firstSelectedTile.y,
            }

            const secondTilePosition = {
                x: this.secondSelectedTile.x,
                y: this.secondSelectedTile.y,
            }

            this.tileGrid[firstTilePosition.y / CONST.tileHeight][
                firstTilePosition.x / CONST.tileWidth
            ] = this.secondSelectedTile
            this.tileGrid[secondTilePosition.y / CONST.tileHeight][
                secondTilePosition.x / CONST.tileWidth
            ] = this.firstSelectedTile

            TweenHelper.moveTo(
                this.scene,
                this.firstSelectedTile,
                this.secondSelectedTile.x,
                this.secondSelectedTile.y,
                CONST.swapSpeed,
                'Linear'
            )

            TweenHelper.moveTo(
                this.scene,
                this.secondSelectedTile,
                this.firstSelectedTile.x,
                this.firstSelectedTile.y,
                CONST.swapSpeed,
                'Linear',
                () => {
                    this.checkMatches()
                }
            )

            this.firstSelectedTile =
                this.tileGrid[firstTilePosition.y / CONST.tileHeight][
                    firstTilePosition.x / CONST.tileWidth
                ]
            this.secondSelectedTile =
                this.tileGrid[secondTilePosition.y / CONST.tileHeight][
                    secondTilePosition.x / CONST.tileWidth
                ]
        }
    }

    private async checkMatches(): Promise<void> {
        const matches = this.getMatches(this.tileGrid)

        if (matches.length > 0) {
            await this.removeTileGroup(matches)
        } else {
            this.swapTiles()
            this.tileUp()
            this.canMove = true
        }
    }

    private async resetTile(): Promise<void> {
        const map = new Map<number, number[]>()

        for (let y = 0; y < this.tileGrid.length; y++) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                if (
                    this.tileGrid[y][x] &&
                    y + 1 < this.tileGrid.length &&
                    this.tileGrid[y + 1][x] === undefined
                ) {
                    if (map.has(x)) {
                        const listInMap = map.get(x)
                        if (listInMap) listInMap[0] = y
                    } else {
                        map.set(x, [y, -1])
                    }
                } else if (this.tileGrid[y][x] === undefined) {
                    if (map.has(x)) {
                        const listInMap = map.get(x)
                        if (listInMap) listInMap[1] = y
                    } else {
                        map.set(x, [-1, y])
                    }
                }
            }
        }

        const promises: Promise<void>[] = []

        map.forEach((values: number[], key: number) => {
            let indexOfBottom = values[1]
            for (let indexOfTop = values[0]; indexOfTop >= 0; indexOfTop--) {
                if (this.tileGrid[indexOfTop][key] == undefined) continue

                const duration = (CONST.tileHeight * (indexOfBottom - indexOfTop)) / CONST.fallSpeed
                promises.push(
                    this.tweenTile(this.tileGrid[indexOfTop][key], key, indexOfBottom, duration)
                )

                const tempTile = this.tileGrid[indexOfTop][key]
                this.tileGrid[indexOfTop][key] = this.tileGrid[indexOfBottom][key]
                this.tileGrid[indexOfBottom][key] = tempTile
                indexOfBottom--
            }
            for (let i = indexOfBottom; i >= 0; i--) {
                const yOffset = i - indexOfBottom - 1
                const tile = this.addTile(key, yOffset)

                const duration = (CONST.tileHeight * (indexOfBottom + 1)) / CONST.fallSpeed
                promises.push(this.tweenTile(tile, key, i, duration))

                this.tileGrid[i][key] = tile
            }
        })

        await Promise.all(promises)
    }

    private tweenTile(
        tile: Tile | undefined,
        x: number,
        y: number,
        duration: number
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            TweenHelper.moveTo(
                this.scene,
                tile,
                x * CONST.tileWidth,
                y * CONST.tileHeight,
                duration,
                'easeInSine',
                () => {
                    resolve()
                }
            )
        })
    }

    private async tileUp(): Promise<void> {
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
        this.currentSelectionImage?.destroy()
        this.currentSelectionImage = undefined
    }

    private async removeTileGroup(matches: Tile[][]): Promise<void> {
        const matchManager = new MatchManager(this.tileGrid)

        for (let i = 0; i < matches.length; i++) {
            const tempArr = matches[i]
            for (let j = 0; j < tempArr.length; j++) {
                const tile = tempArr[j]
                matchManager.addTile(tile)
            }
        }

        await matchManager.refactorMatch()

        if (this.isPlaying) {
            await new Promise<void>((resolve) => {
                matchManager.matchAndRemoveTiles(this.tileGrid, () => {
                    this.resetTimeHintAndIdle()
                    this.resetTile().then(() => {
                        this.tileUp().then(() => {
                            this.checkMatches().then(() => {
                                resolve()
                            })
                        })
                    })
                })
            })
        }
    }

    private getTilePos(tileGrid: (Tile | undefined)[][], tile: Tile): any {
        const pos = { x: -1, y: -1 }

        //Find the position of a specific tile in the grid
        for (let y = 0; y < tileGrid.length; y++) {
            for (let x = 0; x < tileGrid[y].length; x++) {
                //There is a match at this position so return the grid coords
                if (tile === tileGrid[y][x]) {
                    pos.x = x
                    pos.y = y
                    break
                }
            }
        }

        return pos
    }

    private getMatches(tileGrid: (Tile | undefined)[][]): Tile[][] {
        const matches: Tile[][] = []
        let groups: Tile[] = []

        // Check for horizontal matches
        for (let y = 0; y < tileGrid.length; y++) {
            const tempArray = tileGrid[y]
            groups = []
            for (let x = 0; x < tempArray.length; x++) {
                if (x < tempArray.length - 2) {
                    if (tileGrid[y][x] && tileGrid[y][x + 1] && tileGrid[y][x + 2]) {
                        if (
                            tileGrid[y][x]?.texture.key === tileGrid[y][x + 1]?.texture.key &&
                            tileGrid[y][x + 1]?.texture.key === tileGrid[y][x + 2]?.texture.key
                        ) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[y][x]!) == -1) {
                                    matches.push(groups)
                                    groups = []
                                }
                            }

                            if (groups.indexOf(tileGrid[y][x]!) == -1) {
                                groups.push(tileGrid[y][x]!)
                            }

                            if (groups.indexOf(tileGrid[y][x + 1]!) == -1) {
                                groups.push(tileGrid[y][x + 1]!)
                            }

                            if (groups.indexOf(tileGrid[y][x + 2]!) == -1) {
                                groups.push(tileGrid[y][x + 2]!)
                            }
                        }
                    }
                }
            }

            if (groups.length > 0) {
                matches.push(groups)
            }
        }

        //Check for vertical matches
        for (let j = 0; j < tileGrid.length; j++) {
            const tempArr = tileGrid[j]
            groups = []
            for (let i = 0; i < tempArr.length; i++) {
                if (i < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
                        if (
                            tileGrid[i][j]?.texture.key === tileGrid[i + 1][j]?.texture.key &&
                            tileGrid[i + 1][j]?.texture.key === tileGrid[i + 2][j]?.texture.key
                        ) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]!) == -1) {
                                    matches.push(groups)
                                    groups = []
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]!) == -1) {
                                groups.push(tileGrid[i][j]!)
                            }
                            if (groups.indexOf(tileGrid[i + 1][j]!) == -1) {
                                groups.push(tileGrid[i + 1][j]!)
                            }
                            if (groups.indexOf(tileGrid[i + 2][j]!) == -1) {
                                groups.push(tileGrid[i + 2][j]!)
                            }
                        }
                    }
            }
            if (groups.length > 0) matches.push(groups)
        }
        return matches
    }

    private resetTimeHintAndIdle() {
        this.timeSinceInteraction = 0
        this.timeSinceIdle = 0
    }

    private destroyAllTiles(callback?: () => void): Promise<void> {
        return new Promise<void>((resolve) => {
            for (let y = 0; y < this.tileGrid.length; y++) {
                for (let x = 0; x < this.tileGrid[y].length; x++) {
                    if (this.tileGrid[y][x]) {
                        this.tileGrid[y][x]?.destroy()
                    }
                }
            }
            this.tileGrid = []
            this.currentSelectionImage?.destroy()
            this.currentSelectionImage = undefined
            this.firstSelectedTile = undefined
            this.secondSelectedTile = undefined
            this.resetTimeHintAndIdle()

            // Call the callback if provided
            if (callback) {
                callback()
            }

            resolve() // Resolve the Promise after all destruction is done
        })
    }
}

export default GameBoard
