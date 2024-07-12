import CONST from '../const/const'
import Background from '../layout/Background'
import GameBoard from '../layout/GameBoard'
import MainUI from '../layout/MainUI'
import MilestonesUI from '../layout/MilestonesUI'
import Overlay from '../layout/Overlay'
import ScoreManager from '../objects/ScoreManager'

export class GameScene extends Phaser.Scene {
    private background: Background
    private gameBoard: GameBoard
    private mainUI: MainUI
    private milestonesUI: MilestonesUI
    private overlay: Overlay
    private isPlaying = true

    private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null

    constructor() {
        super({
            key: 'GameScene',
        })

        ScoreManager.getInstance().eventEmitter.on('addScore', (score: number) => {
            this.addScoreAndUpdateMainUI(score)
        })

        ScoreManager.getInstance().eventEmitter.on('reachTargetScore', () => {
            this.updateNewRound()
        })
    }

    init(): void {
        this.background = new Background(this, 0, 0)

        this.gameBoard = new GameBoard(this, 100, 150)
        this.gameBoard.init()
        this.gameBoard.setScale(CONST.scale)

        this.mainUI = new MainUI(this, 0, 0, 1000)
        this.mainUI.setProgressBarValue(ScoreManager.getInstance().getProgressRatio())

        const emitter = this.add.particles(100, 300, 'leaf', {
            // x: {
            //     onUpdate: (particle: any) => {
            //         // console.log(particle)
            //         // return particle.x
            //     },
            // },
            lifespan: 2000,
            angle: {
                min: -90,
                max: -30,
            },
            // gravityY: {
            //     onEmit: () => {
            //         return 0
            //     }
            // },
            speed: 150,
            scale: 0.2,
            emitting: false,
        })

        emitter.on('particleEmit', (particle: any) => {
            console.log('New particle emitted:', particle)
        })

        // emitter.setGravityY(50); // Thiết lập trọng lực theo trục Y

        // // Đăng ký sự kiện onUpdate để thêm lực cản không khí
        // emitter.onUpdate((particle: Phaser.GameObjects.Particles.Particle) => {
        //     // Giảm dần tốc độ của hạt để mô phỏng lực cản không khí
        //     if (particle.velocity.y > 0) {
        //         particle.velocity.y -= 5; // Điều chỉnh lực cản không khí ở đây
        //     }
        // });

        // Khởi động bộ phát hạt
        emitter.start()

        emitter.explode(10)
    }

    public addScoreAndUpdateMainUI(score: number) {
        if (this.isPlaying) {
            ScoreManager.getInstance().incrementScore(score)
            const progressRatio = ScoreManager.getInstance().getProgressRatio()
            this.mainUI.updateScore(ScoreManager.getInstance().getCurrentScore())
            this.mainUI.setProgressBarValue(progressRatio)
        }
    }

    public async updateNewRound(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.milestonesUI = new MilestonesUI(this, 0, 0)
            this.milestonesUI
                .setPosition(
                    (CONST.sizeBackgroundWidth * CONST.scale) / 2 - 60,
                    (CONST.sizeBackgroundHeight * CONST.scale) / 2
                )
                .setDepth(2)

            this.overlay = new Overlay(this, 0, 0)

            ScoreManager.getInstance().resetScore()
            this.mainUI.updateScore(ScoreManager.getInstance().getCurrentScore())
            this.mainUI.setProgressBarValue(ScoreManager.getInstance().getProgressRatio())

            this.isPlaying = false
            this.gameBoard.setIsPlaying(false)

            resolve()
        }).then(() => {
            setTimeout(() => {
                this.milestonesUI.destroy()
                this.overlay.destroy()
                this.gameBoard.restart()

                const targetScore = ScoreManager.getInstance().getTargetScore() + 1000
                ScoreManager.getInstance().setTargetScore(targetScore)
                this.mainUI.setTargetScore(targetScore)
                this.isPlaying = true
            }, 2000)
        })
    }
}
