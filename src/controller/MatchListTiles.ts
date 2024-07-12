import CONST from '../const/const'
import TweenHelper from '../helper/TweenHelper'
import ScoreManager from '../objects/ScoreManager'
import Tile from '../objects/Tile'

class MatchListTiles {
    private matchTiles: Tile[]
    private countTiles: number
    private centerTile: Tile
    private tileGrid: (Tile | undefined)[][]

    constructor(tileGrid: (Tile | undefined)[][]) {
        this.matchTiles = []
        this.tileGrid = tileGrid
    }

    public getMatchTiles(): Tile[] {
        return this.matchTiles
    }

    public setMatchTiles(matchTiles: Tile[]): void {
        this.matchTiles = matchTiles
    }

    public addTile(tile: Tile): boolean {
        if (this.matchTiles.length == 0) {
            this.matchTiles.push(tile)
            this.centerTile = tile
            return true
        } else {
            if (this.matchTiles.includes(tile)) {
                return true
            }
            for (let i = 0; i < this.matchTiles.length; i++) {
                if (this.canMatch(this.matchTiles[i], tile)) {
                    this.matchTiles.push(tile)
                    this.centerTile = this.findCenter(this.tileGrid, this.matchTiles)
                    return true
                }
            }
        }
        return false
    }

    private canMatch(originalTile: Tile, otherTile: Tile): boolean {
        if (originalTile.hasSameTypeTile(otherTile)) {
            if (
                this.centerTile.getBoardX() == otherTile.getBoardX() ||
                this.centerTile.getBoardY() == otherTile.getBoardY()
            ) {
                if (
                    originalTile.getBoardX() + 1 == otherTile.getBoardX() &&
                    originalTile.getBoardY() == otherTile.getBoardY()
                ) {
                    // right
                    return true
                }

                // down
                if (
                    originalTile.getBoardX() == otherTile.getBoardX() &&
                    originalTile.getBoardY() + 1 == otherTile.getBoardY()
                ) {
                    return true
                }

                // left
                if (
                    originalTile.getBoardX() - 1 == otherTile.getBoardX() &&
                    originalTile.getBoardY() == otherTile.getBoardY()
                ) {
                    return true
                }

                // top
                if (
                    originalTile.getBoardX() == otherTile.getBoardX() &&
                    originalTile.getBoardY() - 1 == otherTile.getBoardY()
                ) {
                    return true
                }
            }
        }

        return false
    }

    public destroyAllTiles(tileGrid: (Tile | undefined)[][]): void {
        for (let i = this.matchTiles.length - 1; i >= 0; i--) {
            const tile = this.matchTiles[i]

            if (tile.getMatchCount() == 4) {
                this.handleBoomMatchFour(tile, tileGrid)
                return
            } else if (tile.getMatchCount() >= 5) {
                this.handleBoomMatchFive(tile, tileGrid)
                return
            }
        }

        for (let i = this.matchTiles.length - 1; i >= 0; i--) {
            const tile = this.matchTiles[i]
            tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
            tile.destroyTile()
            ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
        }
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

    public handleBoomMatchFive(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
        const boardX = tile.getBoardX()
        const boardY = tile.getBoardY()

        for (let i = boardY - 1; i <= boardY + 1; i++) {
            for (let j = boardX - 1; j <= boardX + 1; j++) {
                if (i >= 0 && i < CONST.gridHeight && j >= 0 && j < CONST.gridWidth) {
                    const tempTile = tileGrid[i][j]
                    if (tempTile) {
                        tileGrid[i][j] = undefined
                        tempTile.destroyTile()
                        ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
                    }
                }
            }
        }

        tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
        tile.destroyTile()
        ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
    }

    public playTween(): void {
        this.matchTiles.forEach((tile) => {
            tile.test()
        })
    }

    private findCenter(tileGrid: (Tile | undefined)[][], targetTile: Tile[]): Tile {
        let count = -1
        let maxCount = -1
        let centerTile = targetTile[0]
        for (let i = 0; i < targetTile.length - 1; i++) {
            const tile = targetTile[i]
            const right = tile.getBoardX() + 1
            const left = tile.getBoardX() - 1
            const up = tile.getBoardY() - 1
            const down = tile.getBoardY() + 1
            let isHorizontal = false
            let isVertical = false
            if (right < CONST.gridWidth) {
                const nextTile = tileGrid[tile.getBoardY()][right]
                if (targetTile.includes(nextTile!)) {
                    count++
                    isHorizontal = true
                }
            }
            if (left >= 0) {
                const nextTile = tileGrid[tile.getBoardY()][left]
                if (targetTile.includes(nextTile!)) {
                    count++
                    isHorizontal = true
                }
            }
            if (down < CONST.gridHeight) {
                const nextTile = tileGrid[down][tile.getBoardX()]
                if (targetTile.includes(nextTile!)) {
                    count++
                    isVertical = true
                }
            }
            if (up >= 0) {
                const nextTile = tileGrid[up][tile.getBoardX()]
                if (targetTile.includes(nextTile!)) {
                    count++
                    isVertical = true
                }
            }
            if (isVertical && isHorizontal) {
                count++
            }
            if (count >= maxCount) {
                maxCount = count
                centerTile = tile
            }
            count = -1
        }
        return centerTile
    }

    public mergeTiles(
        tileGrid: (Tile | undefined)[][],
        finishCallback: Function | undefined = undefined
    ): number {
        const centerTile = this.findCenter(tileGrid, this.matchTiles)
        const coordinates: any[] = []
        const tempTileList: Tile[] = []
        const remainTiles = []
        this.countTiles = 0
        for (let i = 0; i < this.matchTiles.length; i++) {
            const tile = this.matchTiles[i]
            if (tile == centerTile) continue
            if (
                tile.getBoardX() == centerTile.getBoardX() ||
                tile.getBoardY() == centerTile.getBoardY()
            ) {
                coordinates.push({ x: tile.getBoardX(), y: tile.getBoardY() })
                tempTileList.push(tile)
            } else {
                remainTiles.push(tile)
            }
        }

        tempTileList.forEach((tile) => {
            TweenHelper.moveTo(tile.scene, tile, centerTile.x, centerTile.y, 200, 'Linear', () => {
                this.countTiles++
                centerTile.setMatchCount(this.countTiles)
                if (this.countTiles == tempTileList.length) {
                    coordinates.forEach((coordinate) => {
                        const tempTile = tileGrid[coordinate.y][coordinate.x]
                        tileGrid[coordinate.y][coordinate.x] = undefined
                        tempTile?.destroyTile()
                    })
                    if (finishCallback) {
                        finishCallback()
                    }
                }
            })
        })
        ScoreManager.getInstance().eventEmitter.emit(
            'addScore',
            (tempTileList.length + 1) * CONST.addScore
        )
        centerTile.setMatchCount(tempTileList.length)
        centerTile.toggleGlow(true)
        return 1
    }
}

export default MatchListTiles
