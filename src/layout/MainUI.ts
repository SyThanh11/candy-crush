class MainUI extends Phaser.GameObjects.Container {
    private targetScore: number
    private currentScore: number

    private boardTarget: Phaser.GameObjects.Image
    private progressBar: Phaser.GameObjects.Image
    private targetText: Phaser.GameObjects.Text
    private targetScoreText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text
    private progressFill: Phaser.GameObjects.Image

    private emitter: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene, x: number, y: number, targetScore: number) {
        super(scene, x, y)
        this.targetScore = targetScore
        this.currentScore = 0

        this.progressBar = new Phaser.GameObjects.Image(scene, 60, 58, 'bar_1').setOrigin(0, 0)
        this.progressFill = new Phaser.GameObjects.Image(scene, 63, 61, 'bar_2').setOrigin(0, 0)
        this.boardTarget = new Phaser.GameObjects.Image(scene, 320, 20, 'f').setOrigin(0, 0)
        this.targetText = scene.add.text(348, 35, `Target`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ff4500',
            strokeThickness: 6,
        })
        this.targetText.setOrigin(0, 0)
        this.targetScoreText = scene.add.text(357, 70, `${targetScore}`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ff4500',
            strokeThickness: 6,
        })
        this.targetScoreText.setOrigin(0, 0)
        this.scoreText = scene.add.text(150, 90, `${this.currentScore}`, {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#ff4500',
            strokeThickness: 6,
        })
        this.emitter = this.scene.add.particles(
            this.progressFill.x,
            this.progressFill.y,
            'flares',
            {
                y: { min: 0, max: 22 },
                frame: ['red', 'yellow', 'green'],
                lifespan: 300,
                speedX: { min: -150, max: 0 },
                scale: { start: 0.2, end: 0 },
                blendMode: 'ADD',
            }
        )

        this.progressBar.setScale(0.11)
        this.progressFill.setScale(0.107, 0.09)
        this.boardTarget.setScale(0.09)

        this.add(this.boardTarget)

        this.add(this.progressBar)
        this.add(this.progressFill)
        this.add(this.targetText)
        this.add(this.targetScoreText)
        this.add(this.scoreText)
        this.add(this.emitter)

        scene.add.existing(this)
    }

    public updateScore(score: number): void {
        this.currentScore = score
        this.scoreText.setText(`${this.currentScore}`)
    }

    public setTargetScore(targetScore: number): void {
        this.targetScore = targetScore
        this.targetScoreText.setText(`${this.targetScore}`)
    }

    public setProgressBarValue(factor: number): void {
        const xScale = factor * 0.107
        this.scene.add.tween({
            targets: this.progressFill,
            scaleX: xScale,
            ease: 'Linear',
            duration: 1000,
            repeat: 0,
            yoyo: false,
            onUpdate: () => {
                this.emitter.x = this.progressFill.x + this.progressFill.displayWidth
                if (factor == 0) {
                    this.emitter.stop()
                } else {
                    this.emitter.start()
                }
            },
        })
    }
}

export default MainUI
