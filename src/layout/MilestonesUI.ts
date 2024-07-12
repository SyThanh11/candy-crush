import ScoreManager from '../objects/ScoreManager'

class MilestonesUI extends Phaser.GameObjects.Container {
    private popUpBackground: Phaser.GameObjects.Image
    private field: Phaser.GameObjects.Image

    private jellyYellow: Phaser.GameObjects.Image
    private jellyRed: Phaser.GameObjects.Image
    private jellyGreen: Phaser.GameObjects.Image

    private contentText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        this.init()
        scene.add.existing(this)
    }

    public init() {
        this.popUpBackground = new Phaser.GameObjects.Image(this.scene, 0, 0, 'f').setOrigin(0)
        this.popUpBackground.setScale(0.2)

        this.field = new Phaser.GameObjects.Image(this.scene, 0, 0, 'field').setOrigin(0)
        this.field.setScale(0.25)
        this.field.setPosition(
            this.popUpBackground.displayWidth / 2 - this.field.displayWidth / 2,
            this.popUpBackground.displayHeight / 1.6
        )

        this.jellyYellow = new Phaser.GameObjects.Image(this.scene, 0, 0, 'jellyYellow').setOrigin(
            0
        )
        this.jellyYellow.setScale(0.8)
        this.jellyYellow.setPosition(
            this.popUpBackground.displayWidth / 2 - this.jellyYellow.displayWidth / 2,
            this.popUpBackground.displayHeight / 2 - this.jellyYellow.displayHeight / 2
        )
        this.jellyRed = new Phaser.GameObjects.Image(this.scene, 0, 0, 'jellyRed').setOrigin(0)
        this.jellyRed.setScale(0.8)
        this.jellyRed.setPosition(
            this.field.x,
            this.popUpBackground.displayHeight / 2 - this.jellyRed.displayHeight / 2
        )
        this.jellyGreen = new Phaser.GameObjects.Image(this.scene, 0, 0, 'jellyGreen').setOrigin(0)
        this.jellyGreen.setScale(0.8)
        this.jellyGreen.setPosition(
            this.field.x + this.field.displayWidth - this.jellyGreen.displayWidth,
            this.popUpBackground.displayHeight / 2 - this.jellyGreen.displayHeight / 2
        )

        this.contentText = this.scene.add.text(32, 30, 'LEVEL COMPLETE', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ff4500',
            strokeThickness: 6,
        })

        this.scoreText = this.scene.add.text(
            0,
            0,
            `Score: ${ScoreManager.getInstance().getCurrentScore()}`,
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ff4500',
                strokeThickness: 6,
            }
        )
        this.scoreText.setPosition(
            this.popUpBackground.displayWidth / 2 - this.scoreText.width / 2,
            this.popUpBackground.displayHeight / 2 + this.scoreText.height - 4
        )

        this.add(this.popUpBackground)
        this.add(this.field)
        this.add(this.jellyYellow)
        this.add(this.jellyGreen)
        this.add(this.jellyRed)
        this.add(this.contentText)
        this.add(this.scoreText)
    }
}

export default MilestonesUI
