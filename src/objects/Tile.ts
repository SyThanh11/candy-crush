import CONST from '../const/const'
import TweenHelper from '../helper/TweenHelper'
import { ImageConstructor } from '../interfaces/image.interface'

class Tile extends Phaser.GameObjects.Image {
    private speed: number
    private matchCount = 1
    private glow: Phaser.FX.Glow | undefined
    private isHorizontal = true
    private isVisited: boolean
    private typeOfMatch: string

    constructor(params: ImageConstructor) {
        super(params.scene, params.x, params.y, params.texture, params.frame)

        this.speed = 0.4
        this.isVisited = false

        this.setOrigin(0, 0)
        this.setInteractive()
        this.initGlow()

        params.scene.add.existing(this)
    }

    public setTypeOfMatch(type: string) {
        this.typeOfMatch = type
    }

    public getTypeOfMatch(): string {
        return this.typeOfMatch
    }

    public setIsHorizontal(state: boolean): void {
        this.isHorizontal = state
    }

    public getIsHorizontal(): boolean {
        return this.isHorizontal
    }

    public setIsVisited(isVisited: boolean): void {
        this.isVisited = isVisited
    }
    public getIsVisited(): boolean {
        return this.isVisited
    }
    public setSpeed(value: number): void {
        this.speed = value
    }

    public setMatchCount(matchCount: number) {
        this.matchCount = matchCount
    }

    public getMatchCount(): number {
        return this.matchCount
    }

    public getTypeTile(): string {
        return this.texture.key
    }

    public setColorOfGlow(value: number) {
        if (this.glow) {
            this.glow.color = value
        }
    }

    public moveToTarget(
        xCoordinate: number,
        yCoordinate: number,
        callback: Function | undefined = undefined,
        ease = 'Linear'
    ): Phaser.Tweens.Tween | undefined {
        if (!this.scene) return undefined
        let duration = Math.abs(yCoordinate * CONST.tileHeight - this.y) / this.speed
        if (this.getBoardY() == yCoordinate) {
            duration = Math.abs(xCoordinate * CONST.tileWidth - this.x) / this.speed
        }
        return this.scene.add.tween({
            targets: this,
            x: CONST.tileHeight * xCoordinate,
            y: CONST.tileHeight * yCoordinate,
            ease: ease,
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                if (callback) {
                    callback()
                }
            },
        })
    }

    public initAnimationExpode(): Phaser.GameObjects.Particles.ParticleEmitter {
        const emitter = this.scene.add.particles(
            this.x * 0.6 + CONST.tileWidth / 2 + 85,
            this.y * 0.6 + CONST.tileHeight / 2 + 140,
            'flares',
            {
                frame: ['red', 'yellow', 'green'],
                lifespan: 600,
                speed: { min: 50, max: 60 },
                scale: { start: 0.3 * CONST.scale, end: 0 },
                gravityY: 30,
                blendMode: 'ADD',
                emitting: false,
            }
        )

        return emitter
    }

    public destroyTile(callback?: Function | undefined): Promise<void> {
        return new Promise<void>((resolve) => {
            this.initAnimationExpode().explode(16)
            TweenHelper.fadeOutAndZoomIn(this.scene, this, 200, 'Linear', this, () => {
                this.destroy()
                resolve()
            })
        })
    }

    public hasSameTypeTile(otherTile: Tile): boolean {
        return this.texture.key === otherTile.texture.key
    }

    public getBoardX(): number {
        return Math.floor(this.x / CONST.tileWidth)
    }

    public getBoardY(): number {
        return Math.floor(this.y / CONST.tileHeight)
    }

    public test(): void {
        this.scene.add.tween({
            targets: this,
            scale: 1.2,
            duration: 1000,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
        })
    }

    public toggleGlow(state: boolean): void {
        if (!this.glow) return

        this.glow.setActive(state)
        this.scene.tweens.add({
            targets: this.glow,
            outerStrength: 10,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        })
    }

    public initGlow(): void {
        this.preFX?.setPadding(32)
        this.glow = this.preFX?.addGlow()
        this.glow?.setActive(false)
    }

    public isColorBoom(): boolean {
        return this.matchCount >= 5
    }

    public debugTile(): void {
        console.log(
            this.getBoardY(),
            this.getBoardX(),
            'isVisited',
            this.isVisited,
            'texture',
            this.getTypeTile()
        )
    }
}

export default Tile
