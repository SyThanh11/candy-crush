import CONST from '../const/const'
import MatchManager from '../controller/MatchManager'
import ShuffleTiles from '../helper/ShuffleTiles'
import TweenHelper from '../helper/TweenHelper'
import ScoreManager from '../objects/ScoreManager'
import Tile from '../objects/Tile'

class GameBoard extends Phaser.GameObjects.Container {
    private canMove: boolean
    private canDrag: boolean

    private matchManager: MatchManager
    private tileGrid: (Tile | undefined)[][]
    private timeSinceInteraction: number
    private timeSinceIdle: number

    private firstSelectedTile: Tile | undefined
    private secondSelectedTile: Tile | undefined
    private currentSelectionImage: Phaser.GameObjects.Image | undefined
    private shuffleTiles: ShuffleTiles

    private isPlaying = true
    private isResetIdle = false
    private originalPositions: { tile: Tile; x: number; y: number }[] = []
    private idleTweens: Phaser.Tweens.Tween[] = []

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        this.matchManager = new MatchManager(this.tileGrid)

        this.timeSinceInteraction = 0
        this.timeSinceIdle = 0
        this.shuffleTiles = new ShuffleTiles(scene)
        this.scene.add.existing(this)
    }

    init(): void {
        this.canMove = false
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
            this.canMove = false
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
        this.scene.input.on('pointerover', this.startSwipe, this)
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
        this.isResetIdle = true
        let index = 0
        this.originalPositions = []
        this.idleTweens.forEach((tween) => tween.stop())
        this.idleTweens = []
        for (let distance = 0; distance <= CONST.gridHeight + CONST.gridWidth - 2; distance++) {
            for (
                let yOffset = Math.min(distance, CONST.gridHeight - 1);
                yOffset >= Math.max(0, distance - CONST.gridWidth + 1);
                yOffset--
            ) {
                const xOffset = distance - yOffset
                const tile = this.tileGrid[yOffset][xOffset]
                if (tile) {
                    this.originalPositions.push({
                        tile: tile,
                        x: tile.x,
                        y: tile.y,
                    })
                    const tween = this.scene.tweens.add({
                        targets: tile,
                        alpha: 0.5,
                        y: tile.y + 10,
                        duration: 200,
                        ease: 'Linear',
                        yoyo: true,
                        delay: index * 20,
                    })
                    this.idleTweens.push(tween)
                    index++
                }
            }
        }
    }

    public resetIdle(): void {
        this.idleTweens.forEach((tween) => tween.stop())

        this.originalPositions.forEach(({ tile, x, y }) => {
            this.scene.tweens.add({
                targets: tile,
                alpha: 1,
                x: x,
                y: y,
                duration: 0,
                ease: 'Linear',
            })
        })
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
            const image = this.scene.add.image(tile.x, tile.y, 'selection-frame').setOrigin(0)
            tile.setData('selectionImage', image)
            this.add(image)

            const centerX = tile.x
            const centerY = tile.y
            const newX = centerX - (CONST.tileWidth * 0.2) / 2
            const newY = centerY - (CONST.tileHeight * 0.2) / 2

            this.scene.tweens.add({
                targets: image,
                x: newX,
                y: newY,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
            })
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
                        if (image.scaleX !== 1 || image.scaleY !== 1) {
                            this.scene.tweens.killTweensOf(image)
                            image.setScale(1)
                        }
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
            if (this.isResetIdle) {
                this.isResetIdle = false
                this.resetIdle()
            }

            if (this.firstSelectedTile) {
                this.scene.tweens.killTweensOf(this.firstSelectedTile)
            }
            if (this.secondSelectedTile) {
                this.scene.tweens.killTweensOf(this.secondSelectedTile)
            }

            const y = Math.floor(tile.y / CONST.tileHeight)
            const x = Math.floor(tile.x / CONST.tileWidth)

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
        // debugger
        console.log(this.canDrag)

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

    private clickEffect(
        tile: Tile,
        callBack?: Function | undefined,
        callBackUpdate?: Function | undefined
    ): void {
        const centerX = tile.x
        const centerY = tile.y
        const newX = centerX - (CONST.tileWidth * 0.2) / 2
        const newY = centerY - (CONST.tileHeight * 0.2) / 2

        TweenHelper.clickToScale(
            this.scene,
            tile,
            centerX,
            centerY,
            1,
            1,
            0,
            'Linear',
            true,
            callBack,
            callBackUpdate
        )

        this.currentSelectionImage = this.scene.add
            .image(tile.x, tile.y, 'selection-frame')
            .setOrigin(0)
        tile.setData('selectionImage', this.currentSelectionImage)
        this.add(this.currentSelectionImage)

        this.scene.tweens.add({
            targets: this.currentSelectionImage,
            x: newX,
            y: newY,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
        })
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

    private async swapTiles(): Promise<void> {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            this.scene.tweens.killTweensOf(this.firstSelectedTile)
            this.scene.tweens.killTweensOf(this.secondSelectedTile)

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
                    if (this.firstSelectedTile?.isColorBoom()) {
                        if (
                            this.firstSelectedTile?.getTypeOfMatch() === 'LShape' ||
                            this.firstSelectedTile?.getTypeOfMatch() === 'CrossShape'
                        ) {
                            this.checkMatches()
                        } else {
                            this.explodeSameTile(this.firstSelectedTile, this.secondSelectedTile!)
                        }
                    } else if (this.secondSelectedTile?.isColorBoom()) {
                        if (
                            this.secondSelectedTile?.getTypeOfMatch() === 'LShape' ||
                            this.secondSelectedTile?.getTypeOfMatch() === 'CrossShape'
                        ) {
                            this.checkMatches()
                        } else {
                            this.explodeSameTile(this.secondSelectedTile, this.firstSelectedTile!)
                        }
                    } else {
                        this.checkMatches()
                    }
                },
                () => {
                    this.canMove = false
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

    private async explodeSameTile(tileOne: Tile, tileTwo: Tile): Promise<void> {
        for (let y = 0; y < this.tileGrid.length; y++) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                if (this.tileGrid[y][x]?.hasSameTypeTile(tileTwo)) {
                    if (this.tileGrid[y][x]?.getMatchCount() == 4) {
                        this.handleBoomMatchFour(this.tileGrid[y][x]!, this.tileGrid)
                    } else {
                        const tile = this.tileGrid[y][x]
                        this.tileGrid[y][x] = undefined
                        tile?.destroyTile()
                    }
                }
            }
        }

        this.tileGrid[tileOne.getBoardY()][tileOne.getBoardX()] = undefined
        tileOne.destroyTile()

        await this.resetTile()
        await this.tileUp()
        await this.checkMatches()
    }

    public handleBoomMatchFour(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
        if (tile.getIsHorizontal()) {
            for (let i = 0; i < CONST.gridWidth; i++) {
                const tempTile = tileGrid[tile.getBoardY()][i]
                tileGrid[tile.getBoardY()][i] = undefined

                tempTile?.destroyTile()
                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
            }
        } else {
            for (let i = 0; i < CONST.gridHeight; i++) {
                const tempTile = tileGrid[i][tile.getBoardX()]
                tileGrid[i][tile.getBoardX()] = undefined
                tempTile?.destroyTile()
                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
            }
        }

        tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
        tile.destroyTile()
    }

    private async checkMatches(): Promise<void> {
        const matches = this.getMatches(this.tileGrid)

        if (matches.length > 0) {
            await this.removeTileGroup(matches)
            this.canMove = true
        } else {
            await this.swapTiles()
            await this.tileUp()
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
                'Bounce.easeOut',
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
        return new Promise<void>((resolve, reject) => {
            if (!this.tileGrid) {
                resolve()
                return
            }

            this.matchManager.clear()
            this.matchManager.setTileGrid(this.tileGrid)
            this.matchManager.findMatches(matches)
            this.matchManager.refactorMatch()
            this.matchManager.matchAndRemoveTiles(
                this.tileGrid,
                this.secondSelectedTile?.getBoardX()!,
                this.secondSelectedTile?.getBoardY()!,
                async () => {
                    if (this.isPlaying) {
                        this.canMove = false
                        await this.resetTile()
                        await this.tileUp()
                        await this.checkMatches()
                    }
                    resolve()
                },
                () => {
                    console.log('Something went wrong')
                    this.checkMatches()
                    resolve()
                }
            )
        })
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

            if (callback) {
                callback()
            }

            resolve()
        })
    }
}

export default GameBoard
