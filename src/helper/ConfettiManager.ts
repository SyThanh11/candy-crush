import Phaser from 'phaser'
import ConfettiParticle from './ConfettiParticle'

class ConfettiManager {
    private scene: Phaser.Scene
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter
    private rainbowColors: number[]

    constructor(scene: Phaser.Scene, minAngle: number, maxAngle: number) {
        this.scene = scene
        this.createEmitter(minAngle, maxAngle)
        this.rainbowColors = [0xff0000, 0x00ff00, 0x0000ff]
    }

    private createEmitter(minAngle: number, maxAngle: number) {
        const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            lifespan: 3000,
            speed: { min: 200, max: 250 },
            angle: { min: minAngle, max: maxAngle },
            gravityY: 400,
            quantity: 10,
            scaleX: { min: 0.5, max: 1 },
            scaleY: { min: 0.5, max: 1 },
            tint: (
                particle: Phaser.GameObjects.Particles.Particle,
                _key: string,
                _tweenValue: number
            ) => {
                return Phaser.Math.RND.pick(this.rainbowColors) as number
            },
            particleClass: ConfettiParticle,
        }

        this.emitter = this.scene.add.particles(0, 0, 'star', config)
        this.emitter.setDepth(10)
        this.emitter.setScale(5)
        this.emitter.stop()
    }

    public burst(x: number, y: number) {
        this.emitter.setPosition(x, y)
        this.emitter.explode()
    }
}

export default ConfettiManager
