import CONST from '../const/const'
import Tile from '../objects/Tile'
import TweenHelper from './TweenHelper'

class ShuffleTiles {
    private tileGroup: Phaser.GameObjects.Group
    private circle: Phaser.Geom.Circle

    constructor(scene: Phaser.Scene) {
        this.tileGroup = new Phaser.GameObjects.Group(scene)
        this.circle = new Phaser.Geom.Circle(
            CONST.sizeBackgroundWidth / 2 - CONST.tileWidth / 2,
            CONST.sizeBackgroundHeight / 2 - CONST.tileHeight / 2,
            64
        )
    }

    public playSuffle(scene: Phaser.Scene, callBackComplete?: Function | undefined) {
        Phaser.Actions.PlaceOnCircle(this.tileGroup.getChildren(), this.circle)

        TweenHelper.shuffleCircle(
            scene,
            this.circle,
            200,
            'Quintic.easeInOut',
            1000,
            true,
            0,
            () => {
                Phaser.Actions.RotateAroundDistance(
                    this.tileGroup.getChildren(),
                    {
                        x: CONST.sizeBackgroundWidth / 2 - CONST.tileWidth / 2,
                        y: CONST.sizeBackgroundHeight / 2 - CONST.tileHeight / 2,
                    },
                    0.05,
                    this.circle.radius
                )
            },
            callBackComplete
        )
    }

    public addTile(tile: Tile): void {
        this.tileGroup.add(tile)
    }

    public removeTile(tile: Tile): void {
        this.tileGroup.remove(tile)
    }
}

export default ShuffleTiles
