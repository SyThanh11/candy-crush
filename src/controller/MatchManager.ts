import CONST from '../const/const'
import Tile from '../objects/Tile'
import MatchListTiles from './MatchListTiles'

class MatchManager {
    private matchManager: MatchListTiles[]
    private tileGrid: (Tile | undefined)[][]
    private countTileLeft: number

    constructor(tileGrid: (Tile | undefined)[][]) {
        this.matchManager = [new MatchListTiles()]
        this.tileGrid = tileGrid
    }

    public isMatch(row: number, col: number, potentialTile: Tile): boolean {
        return (
            row >= 0 &&
            row < CONST.gridHeight &&
            col >= 0 &&
            col < CONST.gridWidth &&
            !this.tileGrid[row][col]?.getIsVisited() &&
            this.tileGrid[row][col]?.getTypeTile() == potentialTile.getTypeTile()
        )
    }

    private checkCrossShape(tile: Tile): { x: number; y: number }[] | null {
        const positions: { x: number; y: number }[] = []
        const row = tile.getBoardY()
        const col = tile.getBoardX()
        if (this.isMatch(row, col, tile)) {
            positions.push({ y: row, x: col })
            tile.setIsVisited(true)
            // Check upwards
            let i = 1
            while (this.isMatch(row - i, col, tile)) {
                positions.push({ y: row - i, x: col })
                this.tileGrid[row - i][col]?.setIsVisited(true)
                i++
            }

            // Check downwards
            i = 1
            while (this.isMatch(row + i, col, tile)) {
                positions.push({ y: row + i, x: col })
                this.tileGrid[row + i][col]?.setIsVisited(true)
                i++
            }

            // Check leftwards
            i = 1
            while (this.isMatch(row, col - i, tile)) {
                positions.push({ y: row, x: col - i })
                this.tileGrid[row][col - i]?.setIsVisited(true)
                i++
            }

            // Check rightwards
            i = 1
            while (this.isMatch(row, col + i, tile)) {
                positions.push({ y: row, x: col + i })
                this.tileGrid[row][col + i]?.setIsVisited(true)
                i++
            }
        }

        if (positions.length < 5) {
            for (let i = 0; i < positions.length; i++) {
                const position = positions[i]
                this.tileGrid[position.y][position.x]?.setIsVisited(false)
            }

            return null
        } else {
            return positions
        }
    }

    private checkMatchVertical(tile: Tile, lengthMatch: number): { x: number; y: number }[] | null {
        const positions: { x: number; y: number }[] = []
        const row = tile.getBoardY()
        const col = tile.getBoardX()
        if (this.isMatch(row, col, tile)) {
            positions.push({ y: row, x: col })
            tile.setIsVisited(true)
            let i = 1
            while (this.isMatch(row - i, col, tile)) {
                positions.push({ y: row - i, x: col })
                this.tileGrid[row - i][col]?.setIsVisited(true)
                i++
            }

            i = 1
            while (this.isMatch(row + i, col, tile)) {
                positions.push({ y: row + i, x: col })
                this.tileGrid[row + i][col]?.setIsVisited(true)
                i++
            }
        }

        if (positions.length < lengthMatch) {
            for (let i = 0; i < positions.length; i++) {
                const position = positions[i]
                this.tileGrid[position.y][position.x]?.setIsVisited(false)
            }

            return null
        } else {
            return positions
        }
    }

    private checkMatchHorizontal(
        tile: Tile,
        lengthMatch: number
    ): { x: number; y: number }[] | null {
        const positions: { x: number; y: number }[] = []
        const row = tile.getBoardY()
        const col = tile.getBoardX()
        if (this.isMatch(row, col, tile)) {
            positions.push({ y: row, x: col })
            tile.setIsVisited(true)
            let i = 1
            while (this.isMatch(row, col - i, tile)) {
                positions.push({ y: row, x: col - i })
                this.tileGrid[row][col - i]?.setIsVisited(true)
                i++
            }

            // Check rightwards
            i = 1
            while (this.isMatch(row, col + i, tile)) {
                positions.push({ y: row, x: col + i })
                this.tileGrid[row][col + i]?.setIsVisited(true)
                i++
            }
        }

        if (positions.length < lengthMatch) {
            for (let i = 0; i < positions.length; i++) {
                const position = positions[i]
                this.tileGrid[position.y][position.x]?.setIsVisited(false)
            }

            return null
        } else {
            return positions
        }
    }

    private checkLShape(tile: Tile): { x: number; y: number }[] | null {
        const positions: { x: number; y: number }[] = []
        const row = tile.getBoardY()
        const col = tile.getBoardX()
        if (this.isMatch(row, col, tile)) {
            positions.push({ y: row, x: col })
            tile.setIsVisited(true)
            // Check vertical + horizontal arms (upward + leftward)
            let i = 1
            while (this.isMatch(row - i, col, tile)) {
                positions.push({ y: row - i, x: col })
                this.tileGrid[row - i][col]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }
            i = 1
            while (this.isMatch(row, col - i, tile)) {
                positions.push({ y: row, x: col - i })
                this.tileGrid[row][col - i]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }

            // Check vertical + horizontal arms (upward + rightward)
            i = 1
            while (this.isMatch(row - i, col, tile)) {
                positions.push({ y: row - i, x: col })
                this.tileGrid[row - i][col]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }
            i = 1
            while (this.isMatch(row, col + i, tile)) {
                positions.push({ y: row, x: col + i })
                this.tileGrid[row][col + i]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }

            // Check vertical + horizontal arms (downward + leftward)
            i = 1
            while (this.isMatch(row + i, col, tile)) {
                positions.push({ y: row + i, x: col })
                this.tileGrid[row + i][col]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }
            i = 1
            while (this.isMatch(row, col - i, tile)) {
                positions.push({ y: row, x: col - i })
                this.tileGrid[row][col - i]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }

            // Check vertical + horizontal arms (downward + rightward)
            i = 1
            while (this.isMatch(row + i, col, tile)) {
                positions.push({ y: row + i, x: col })
                this.tileGrid[row + i][col]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }
            i = 1
            while (this.isMatch(row, col + i, tile)) {
                positions.push({ y: row, x: col + i })
                this.tileGrid[row][col + i]?.setIsVisited(true)
                i++
            }
            if (i == 2) {
                const pos = positions.splice(positions.length - 1, 1)
                this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
            }
        }
        if (positions.length < 5) {
            for (let i = 0; i < positions.length; i++) {
                const position = positions[i]
                this.tileGrid[position.y][position.x]?.setIsVisited(false)
            }

            return null
        } else {
            return positions
        }
    }

    public findMatches(matches: Tile[][]): void {
        let matchFound = null

        for (let row = 0; row < matches.length; row++) {
            for (let col = 0; col < matches[row].length; col++) {
                this.countTileLeft += 1
            }
        }
        if (this.countTileLeft >= 5) {
            for (let row = 0; row < matches.length; row++) {
                let flag = false
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkLShape(tile)

                    if (matchFound != null) {
                        this.addMatch(matchFound)
                        if (this.countTileLeft < 5) {
                            flag = true
                            break
                        }
                    }
                }
                if (flag) {
                    break
                }
            }
        }

        if (this.countTileLeft >= 5) {
            for (let row = 0; row < matches.length; row++) {
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkCrossShape(tile)
                    if (matchFound != null) {
                        this.addMatch(matchFound)
                    }
                }
            }
        }

        if (this.countTileLeft >= 4) {
            for (let row = 0; row < matches.length; row++) {
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkMatchVertical(tile, 4)
                    if (matchFound != null) {
                        this.addMatch(matchFound)
                    }
                }
            }
        }
        if (this.countTileLeft >= 4) {
            for (let row = 0; row < matches.length; row++) {
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkMatchHorizontal(tile, 4)
                    if (matchFound != null) {
                        this.addMatch(matchFound)
                    }
                }
            }
        }

        if (this.countTileLeft >= 3) {
            for (let row = 0; row < matches.length; row++) {
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkMatchVertical(tile, 3)
                    if (matchFound != null) {
                        this.addMatch(matchFound)
                    }
                }
            }
        }
        if (this.countTileLeft >= 3) {
            for (let row = 0; row < matches.length; row++) {
                for (let col = 0; col < matches[row].length; col++) {
                    const tile = matches[row][col]
                    if (!tile) continue
                    if (tile.getIsVisited()) continue
                    matchFound = this.checkMatchHorizontal(tile, 3)
                    if (matchFound != null) {
                        this.addMatch(matchFound)
                    }
                }
            }
        }
    }

    private addMatch(positions: { x: number; y: number }[]): void {
        const matchList = new MatchListTiles()
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i]
            const tile = this.tileGrid[position.y][position.x]
            matchList.addTile(tile!)
            this.countTileLeft -= 1
        }
        this.matchManager.push(matchList)
    }

    public refactorMatch(): void {
        for (let i = this.matchManager.length - 1; i >= 0; i--) {
            const tileList = this.matchManager[i].getMatchTiles()
            if (tileList.length == 3) {
                if (
                    tileList[1].getBoardX() == tileList[2].getBoardY() &&
                    tileList[1].getBoardY() == tileList[2].getBoardX()
                ) {
                    this.matchManager.splice(i, 1)
                }
            }
        }
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid.length; j++) {
                const tile = this.tileGrid[i][j]
                if (tile) {
                    tile.setIsVisited(false)
                }
            }
        }
    }
    public matchAndRemoveTiles(
        tileGrid: (Tile | undefined)[][],
        xMergeCoordinate: number,
        yMergeCoordinate: number,
        callback: Function | undefined = undefined,
        anotherCallback: Function | undefined = undefined
    ): void {
        let count = 0
        if (this.matchManager.length == 0) {
            if (anotherCallback) {
                anotherCallback()
            }
        }
        for (let i = this.matchManager.length - 1; i >= 0; i--) {
            const matchList = this.matchManager[i].getMatchTiles()
            if (matchList.length == 3) {
                this.matchManager[i].destroyAllTiles(tileGrid)
            } else if (matchList.length > 3) {
                count += this.matchManager[i].mergeTiles(
                    tileGrid,
                    xMergeCoordinate,
                    yMergeCoordinate,
                    () => {
                        count--

                        if (count == 0) {
                            if (callback) {
                                callback()
                            }
                        }
                    }
                )
            }
        }
        this.clear()

        if (count == 0) {
            if (callback) {
                callback()
            }
        }
    }
    public clear() {
        if (!this.matchManager) return
        this.matchManager.splice(0, this.matchManager.length)
    }
    public setTileGrid(tileGrid: (Tile | undefined)[][]) {
        this.tileGrid = tileGrid
        this.countTileLeft = 0
    }
}

export default MatchManager
