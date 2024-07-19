import CONST from '../const/const'
import ScoreManager from '../objects/ScoreManager'
import Tile from '../objects/Tile'

class MatchListTiles {
    private matchTiles: Tile[]
    private countTiles: number

    constructor() {
        this.matchTiles = []
    }

    public getMatchTiles(): Tile[] {
        return this.matchTiles
    }

    public setMatchTiles(matchTiles: Tile[]): void {
        this.matchTiles = matchTiles
    }

    public addTile(tile: Tile): void {
        this.matchTiles.push(tile)
    }

    public async destroyAllTiles(tileGrid: (Tile | undefined)[][]): Promise<void> {
        const promises: Promise<void>[] = []

        for (let i = this.matchTiles.length - 1; i >= 0; i--) {
            const tile = this.matchTiles[i]

            if (tile.getMatchCount() === 4) {
                promises.push(this.handleBoomMatchFour(tile, tileGrid))
            } else if (tile.getMatchCount() >= 5) {
                promises.push(this.handleBoomMatchFive(tileGrid, tile))
            } else {
                tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
                const destroyPromise = new Promise<void>((resolve) => {
                    tile.destroyTile(() => {
                        ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
                        resolve()
                    })
                })
                promises.push(destroyPromise)
            }
        }

        await Promise.all(promises)
    }

    public async handleBoomMatchFour(tile: Tile, tileGrid: (Tile | undefined)[][]): Promise<void> {
        const promises: Promise<void>[] = []

        if (tile.getIsHorizontal()) {
            // Handle horizontally
            for (let i = 0; i < CONST.gridWidth; i++) {
                const tempTile = tileGrid[tile.getBoardY()][i]

                if (tempTile && tempTile !== tile) {
                    tileGrid[tile.getBoardY()][i] = undefined
                    const promise = this.animateTileExplosion(tempTile)
                    promises.push(promise)
                }

                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
                await this.delay(50)
            }
        } else {
            // Handle vertically
            for (let i = 0; i < CONST.gridHeight; i++) {
                const tempTile = tileGrid[i][tile.getBoardX()]

                if (tempTile && tempTile !== tile) {
                    tileGrid[i][tile.getBoardX()] = undefined
                    const promise = this.animateTileExplosion(tempTile)
                    promises.push(promise)
                }

                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
                await this.delay(50)
            }

            console.log(tileGrid)
        }

        await this.animateTileExplosion(tile)

        await Promise.all(promises)
    }

    private animateTileExplosion(tile: Tile): Promise<void> {
        return new Promise<void>((resolve) => {
            tile.destroyTile(() => {
                tile.scene.tweens.add({
                    targets: tile,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 200,
                    ease: 'Linear',
                    onComplete: () => {
                        resolve()
                    },
                })
            })
        })
    }

    private delay(ms: number): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, ms))
    }

    private handleBoomMatchFive(
        tileGrid: (Tile | undefined)[][],
        centerTile: Tile | undefined = undefined
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            const tile =
                centerTile == undefined ? this.findCenter(tileGrid, this.matchTiles) : centerTile
            const left = tile.getBoardX() - 1 >= 0 ? tile.getBoardX() - 1 : 0
            const right =
                tile.getBoardX() + 1 < CONST.gridWidth ? tile.getBoardX() + 1 : CONST.gridWidth - 1
            const up = tile.getBoardY() - 1 >= 0 ? tile.getBoardY() - 1 : 0
            const down =
                tile.getBoardY() + 1 < CONST.gridHeight
                    ? tile.getBoardY() + 1
                    : CONST.gridHeight - 1

            const promises: Promise<void>[] = []

            for (let i = up; i <= down; i++) {
                for (let j = left; j <= right; j++) {
                    const tempTile = tileGrid[i][j]
                    if (tempTile) {
                        const destroyPromise = new Promise<void>((resolve) => {
                            tempTile.destroyTile(() => {
                                resolve()
                            })
                        })
                        promises.push(destroyPromise)
                        tileGrid[i][j] = undefined
                    }
                }
            }

            const centerDestroyPromise = new Promise<void>((resolve) => {
                tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
                tile.destroyTile(() => {
                    resolve()
                })
            })
            promises.push(centerDestroyPromise)

            Promise.all(promises).then(() => {
                resolve()
            })
        })
    }

    public mergeTiles(
        tileGrid: (Tile | undefined)[][],
        boardX: number,
        boardY: number,
        finishCallback: Function | undefined = undefined
    ): number {
        if (this.matchTiles.length <= 3) {
            return 0
        }
        let centerTile = this.findCenter(tileGrid, this.matchTiles)
        const coordinates: any[] = []
        const tempTileList: Tile[] = []
        const remainTiles = []
        this.countTiles = 0
        let preTile = undefined
        let flag = true

        for (let i = 0; i < this.matchTiles.length; i++) {
            if (this.matchTiles[i].getMatchCount() == 4) {
                this.destroyAllTilesExcept(this.matchTiles[i], tileGrid)
                this.handleBoomMatchFour(this.matchTiles[i], tileGrid)

                return 0
            } else if (this.matchTiles[i].getMatchCount() >= 5) {
                this.destroyAllTilesExcept(this.matchTiles[i], tileGrid)
                this.handleBoomMatchFive(tileGrid, this.matchTiles[i])

                return 0
            }
        }

        for (let i = 0; i < this.matchTiles.length; i++) {
            const tile = this.matchTiles[i]
            if (preTile) {
                if (preTile.getBoardY() >= tile.getBoardY()) {
                    flag = false
                }
            }

            if (tile.getBoardX() == boardX && tile.getBoardY() == boardY) {
                centerTile = tile
                flag = false
                break
            }
            preTile = tile
        }
        if (flag) {
            centerTile = this.matchTiles[this.matchTiles.length - 1]
        }
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
            centerTile.setIsHorizontal(centerTile.getBoardX() == tile.getBoardX())
            centerTile.setMatchCount(centerTile.getMatchCount() + tile.getMatchCount())
            tile.setSpeed(0.5)
            tile.moveToTarget(centerTile.getBoardX(), centerTile.getBoardY(), () => {
                this.countTiles++
                tile.setVisible(false)
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

        if (centerTile.isColorBoom()) {
            if (
                centerTile.getTypeOfMatch() === 'LShape' ||
                centerTile.getTypeOfMatch() === 'CrossShape'
            ) {
                centerTile.setColorOfGlow(0xff0000)
            } else {
                centerTile.setTexture('boom')
            }
        }

        ScoreManager.getInstance().incrementScore((tempTileList.length + 1) * CONST.addScore)

        centerTile.setIsVisited(false)
        centerTile.toggleGlow(true)

        return 1
    }

    private destroyAllTilesExcept(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
        this.matchTiles.forEach((tempTile) => {
            if (tempTile != tile) {
                tileGrid[tempTile.getBoardX()][tempTile.getBoardY()] = undefined
                tempTile.destroyTile()
            }
        })
    }

    private findCenter(tileGrid: (Tile | undefined)[][], targetTile: Tile[]): Tile {
        let flag = true
        let centerTile = targetTile[0]
        for (let i = 0; i < targetTile.length - 1; i++) {
            for (let j = 1; j < targetTile.length - 1; j++) {
                if (
                    targetTile[i].getBoardX() != targetTile[j].getBoardX() &&
                    targetTile[i].getBoardY() != targetTile[j].getBoardY()
                ) {
                    flag = false
                    break
                }
            }
            if (flag) {
                centerTile = targetTile[i]
                break
            }
        }
        return centerTile
    }
}

export default MatchListTiles