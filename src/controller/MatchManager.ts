import Tile from '../objects/Tile'
import MatchListTiles from './MatchListTiles'

class MatchManager {
    private matchManager: MatchListTiles[]
    private tileGrid: (Tile | undefined)[][]

    constructor(tileGrid: (Tile | undefined)[][]) {
        this.matchManager = [new MatchListTiles(tileGrid)]
        this.tileGrid = tileGrid
    }

    public addTile(tile: Tile) {
        for (let i = 0; i < this.matchManager.length; i++) {
            if (this.matchManager[i].addTile(tile)) {
                return
            }
        }
        const matchListTiles = new MatchListTiles(this.tileGrid)
        matchListTiles.addTile(tile)
        this.matchManager.push(matchListTiles)
    }

    public playTween(): void {
        this.matchManager.forEach((list) => {
            list.playTween()
        })
    }

    public refactorMatch(): Promise<void> {
        return new Promise<void>((resolve) => {
            for (let i = this.matchManager.length - 1; i >= 0; i--) {
                const tileList = this.matchManager[i].getMatchTiles()
                if (tileList.length < 3) {
                    for (let j = 0; j < tileList.length; j++) {
                        this.addTile(tileList[j])
                    }
                    this.matchManager.splice(i, 1)
                }
            }
            resolve() // Resolve the Promise after processing
        })
    }

    public matchAndRemoveTiles(
        tileGrid: (Tile | undefined)[][],
        callback: Function | undefined = undefined
    ): void {
        let count = 0

        // Calculate total count of merge operations
        for (let i = this.matchManager.length - 1; i >= 0; i--) {
            const matchList = this.matchManager[i].getMatchTiles()
            if (matchList.length == 3) {
                this.matchManager[i].destroyAllTiles(tileGrid)
            } else if (matchList.length > 3) {
                count += this.matchManager[i].mergeTiles(tileGrid, () => {
                    count--
                    if (count === 0 && callback) {
                        callback()
                    }
                })
            }
            this.matchManager.splice(i, 1)
        }

        if (count === 0 && callback) {
            callback()
        }
    }
}

export default MatchManager
