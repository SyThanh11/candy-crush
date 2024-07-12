class Overlay extends Phaser.GameObjects.Container {
    private overlay: Phaser.GameObjects.Graphics

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        this.overlay = this.scene.add.graphics()
        this.overlay.fillStyle(0x000000, 0.7)
        this.overlay.fillRect(
            0,
            0,
            this.scene.game.config.width as number,
            this.scene.game.config.height as number
        )
        this.overlay.setDepth(1)

        this.add(this.overlay)
        scene.add.existing(this)
    }
}

export default Overlay
