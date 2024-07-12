class Background extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        const image = new Phaser.GameObjects.Image(scene, 0, 0, 'background').setOrigin(0, 0)
        image.setScale(0.16)

        this.add(image)
        scene.add.existing(this)
    }
}

export default Background
