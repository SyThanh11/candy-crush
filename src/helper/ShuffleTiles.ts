import CONST from '../const/const'
import Tile from '../objects/Tile'
import TweenHelper from './TweenHelper'

class ShuffleTiles {
    private tileGroup: Phaser.GameObjects.Group
    private ellipse: Phaser.Geom.Ellipse

    constructor(scene: Phaser.Scene) {
        this.tileGroup = new Phaser.GameObjects.Group(scene)
        // Adjust ellipse parameters to create a proper ellipse shape
        this.ellipse = new Phaser.Geom.Ellipse(
            CONST.sizeBackgroundWidth / 2 - CONST.tileWidth / 2,
            CONST.sizeBackgroundHeight / 2 - CONST.tileHeight / 2,
            200, // width of the ellipse
            100 // height of the ellipse
        )
    }

    public playSuffle(scene: Phaser.Scene, callBackComplete?: Function | undefined) {
        // Define your ellipse parameters
        const ellipse = new Phaser.Geom.Ellipse(
            CONST.sizeBackgroundWidth / 2 - CONST.tileWidth / 2, // centerX: X coordinate of the center of the ellipse
            CONST.sizeBackgroundHeight / 2 - CONST.tileHeight / 2, // centerY: Y coordinate of the center of the ellipse
            200, // width: Width of the ellipse
            100 // height: Height of the ellipse
        )

        // Place objects on the ellipse
        Phaser.Actions.PlaceOnEllipse(this.tileGroup.getChildren(), ellipse)

        // Perform shuffle animation
        TweenHelper.shuffleEllipse(
            scene,
            ellipse,
            ellipse.width + 200, // increase width for animation
            ellipse.height + 100, // increase height for animation
            'Quintic.easeInOut',
            1000,
            true,
            0,
            () => {
                // Calculate the center of the ellipse
                const centerX = ellipse.x
                const centerY = ellipse.y

                // Calculate the distance from pivot (center of ellipse) to objects
                const distance = Phaser.Math.Distance.Between(
                    centerX,
                    centerY,
                    centerX + ellipse.width / 2, // Use any point on ellipse
                    centerY + ellipse.height / 2
                )

                // Rotate objects around the ellipse
                Phaser.Actions.RotateAroundDistance(
                    this.tileGroup.getChildren(),
                    { x: centerX, y: centerY }, // Pivot point
                    0.05, // Angle increment
                    distance // Distance from pivot to objects
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
