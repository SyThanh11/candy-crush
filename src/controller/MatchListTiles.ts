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
                const destroyPromise = new Promise<void>(() => {
                    tile.destroyTile()
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
            const row = tile.getBoardY()
            for (let col = 0; col < CONST.gridWidth; col++) {
                const tempTile = tileGrid[row][col]
                if (tempTile && tempTile !== tile) {
                    tileGrid[row][col] = undefined
                    const delayMs = 50 * col
                    const promise = this.animateTileExplosion(tempTile, delayMs)
                    promises.push(promise)
                }

                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
            }
        } else {
            // Handle vertically
            const col = tile.getBoardX()
            for (let row = 0; row < CONST.gridHeight; row++) {
                const tempTile = tileGrid[row][col]
                if (tempTile && tempTile !== tile) {
                    tileGrid[row][col] = undefined
                    const delayMs = 50 * row
                    const promise = this.animateTileExplosion(tempTile, delayMs)
                    promises.push(promise)
                }
                ScoreManager.getInstance().eventEmitter.emit('addScore', CONST.addScore)
            }
        }

        // Set the tile to undefined in tileGrid and destroy it last
        tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
        await this.animateTileExplosion(tile, 0)

        // Wait for all animations to complete
        await Promise.all(promises)
    }

    private animateTileExplosion(tile: Tile, delayMs: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
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
            }, delayMs)
        })
    }

    public async handleBoomMatchFive(
        tileGrid: (Tile | undefined)[][],
        centerTile: Tile | undefined = undefined
    ): Promise<void> {
        const promises: Promise<void>[] = []

        const tile = centerTile ?? this.findCenter(tileGrid, this.matchTiles)
        const startX = Math.max(tile.getBoardX() - 1, 0)
        const endX = Math.min(tile.getBoardX() + 1, CONST.gridWidth - 1)
        const startY = Math.max(tile.getBoardY() - 1, 0)
        const endY = Math.min(tile.getBoardY() + 1, CONST.gridHeight - 1)

        // Animate all tiles around the center
        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                const tempTile = tileGrid[row][col]
                if (tempTile && tempTile !== tile) {
                    tileGrid[row][col] = undefined
                    const delay = this.calculateDelay(tile, tempTile)
                    const promise = this.animateTileExplosionFive(tempTile, delay)
                    promises.push(promise)
                }
            }
        }

        // Animate center tile
        tileGrid[tile.getBoardY()][tile.getBoardX()] = undefined
        const centerDelay = 0 // No delay for the center tile
        await this.animateTileExplosionFive(tile, centerDelay)

        await Promise.all(promises)
    }

    private calculateDelay(centerTile: Tile, tempTile: Tile): number {
        const distance = Phaser.Math.Distance.Between(
            centerTile.getBoardX(),
            centerTile.getBoardY(),
            tempTile.getBoardX(),
            tempTile.getBoardY()
        )
        return distance * 50
    }

    private animateTileExplosionFive(tile: Tile, delay: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
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
            }, delay)
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
