(()=>{"use strict";var e,t={325:(e,t,i)=>{var s=i(440),h=i.n(s);const r={score:0,highscore:0,gridWidth:8,gridHeight:8,tileWidth:64,tileHeight:64,candyTypes:["jellyYellow","jellyBlack","jellyPink","jellyBlue","jellyRed","jellyGreen"],fallSpeed:.2,swapSpeed:200,delayShowHint:9e3,delayShowIdle:6e3,sizeBackgroundWidth:512,sizeBackgroundHeight:512,scale:.6,addScore:20};class l extends Phaser.Scene{constructor(){super({key:"BootScene"})}preload(){this.cameras.main.setBackgroundColor(10016391),this.createLoadingbar(),this.load.on("progress",(e=>{this.progressBar.clear(),this.progressBar.fillStyle(16774867,1),this.progressBar.fillRect(this.cameras.main.width/4,this.cameras.main.height/2-16,this.cameras.main.width/2*e,16)}),this),this.load.on("complete",(()=>{this.progressBar.destroy(),this.loadingBar.destroy()}),this),this.load.pack("preload","./assets/pack.json","preload"),this.load.atlas("flares","https://labs.phaser.io/assets/particles/flares.png","https://labs.phaser.io/assets/particles/flares.json")}update(){this.scene.start("GameScene")}createLoadingbar(){this.loadingBar=this.add.graphics(),this.loadingBar.fillStyle(6139463,1),this.loadingBar.fillRect(this.cameras.main.width/4-2,this.cameras.main.height/2-18,this.cameras.main.width/2+4,20),this.progressBar=this.add.graphics()}}class n extends h().GameObjects.Particles.Particle{constructor(e){super(e),this.drag=.99,this.swayAmplitude=h().Math.Between(5,7),this.swayFrequency=h().Math.FloatBetween(.01,.03),this.swayPhase=h().Math.FloatBetween(0,2*Math.PI),this.maxVeY=Number.MAX_VALUE,this.isDropped=!1,this.isDown=!1}update(e,t,i){const s=super.update(e,t,i),r=e/1e3;return this.maxVeY>this.velocityY&&(this.maxVeY=this.velocityY),this.swayPhase+=this.swayFrequency,Math.abs(this.velocityY)<.999*Math.abs(this.maxVeY)?(this.isDown||(this.velocityY=h().Math.Linear(this.velocityY,0,3*r)),(this.velocityY>7||this.isDown)&&(this.alpha-=.2*r,this.velocityY=7,this.isDown=!0),this.x+=Math.sin(this.swayPhase)*this.swayAmplitude*r,this.angle+=100*r,this.isDropped=!0):this.isDropped||(this.angle+=30*r,this.velocityY*=this.drag),this.velocityX=h().Math.Linear(this.velocityX,0,3*r),s}}const a=n,o=class{constructor(e,t,i){this.scene=e,this.createEmitter(t,i),this.rainbowColors=[16711680,65280,255]}createEmitter(e,t){const i={lifespan:4e3,speed:{min:200,max:250},accelerationY:100,angle:{min:e,max:t},quantity:10,scaleX:{min:.5,max:1},scaleY:{min:.5,max:1},tint:(e,t,i)=>h().Math.RND.pick(this.rainbowColors),particleClass:a};this.emitter=this.scene.add.particles(0,0,"star",i),this.emitter.setDepth(10),this.emitter.setScale(5),this.emitter.stop()}burst(e,t){this.emitter.setPosition(e,t),this.emitter.explode()}};class d extends Phaser.GameObjects.Container{constructor(e,t,i){super(e,t,i);const s=new Phaser.GameObjects.Image(e,0,0,"background").setOrigin(0,0);s.setScale(.16),this.add(s),e.add.existing(this)}}const c=d;class g{constructor(){this.currentScore=0,this.targetScore=1e3,this.eventEmitter=new Phaser.Events.EventEmitter}static getInstance(){return g.instance||(g.instance=new g),g.instance}incrementScore(e){this.currentScore+=e,this.isTargetScoreReached()&&this.eventEmitter.emit("reachTargetScore")}getCurrentScore(){return this.currentScore}isTargetScoreReached(){return this.currentScore>=this.targetScore}resetScore(){this.currentScore=0}getTargetScore(){return this.targetScore}setTargetScore(e){this.targetScore=e}getProgressRatio(){return this.currentScore/this.targetScore}}const u=g;var f=function(e,t,i,s){return new(i||(i=Promise))((function(h,r){function l(e){try{a(s.next(e))}catch(e){r(e)}}function n(e){try{a(s.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?h(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(l,n)}a((s=s.apply(e,t||[])).next())}))};const p=class{constructor(){this.matchTiles=[]}getMatchTiles(){return this.matchTiles}setMatchTiles(e){this.matchTiles=e}addTile(e){this.matchTiles.push(e)}destroyAllTiles(e){return f(this,void 0,void 0,(function*(){const t=[];for(let i=this.matchTiles.length-1;i>=0;i--){const s=this.matchTiles[i];if(4===s.getMatchCount())t.push(this.handleBoomMatchFour(s,e));else if(s.getMatchCount()>=5)t.push(this.handleBoomMatchFive(e,s));else{e[s.getBoardY()][s.getBoardX()]=void 0;const i=new Promise((e=>{s.destroyTile((()=>{u.getInstance().eventEmitter.emit("addScore",r.addScore),e()}))}));t.push(i)}}yield Promise.all(t)}))}handleBoomMatchFour(e,t){return f(this,void 0,void 0,(function*(){const i=[];if(e.getIsHorizontal()){const s=e.getBoardY();for(let h=0;h<r.gridWidth;h++){const l=t[s][h];if(l&&l!==e){t[s][h]=void 0;const e=this.animateTileExplosion(l);i.push(e)}u.getInstance().eventEmitter.emit("addScore",r.addScore)}}else{const s=e.getBoardX();for(let h=0;h<r.gridHeight;h++){const l=t[h][s];if(l&&l!==e){t[h][s]=void 0;const e=this.animateTileExplosion(l);i.push(e)}u.getInstance().eventEmitter.emit("addScore",r.addScore)}}t[e.getBoardY()][e.getBoardX()]=void 0,yield this.animateTileExplosion(e),yield Promise.all(i)}))}animateTileExplosion(e){return new Promise((t=>{e.destroyTile((()=>{e.scene.tweens.add({targets:e,scaleX:0,scaleY:0,duration:200,ease:"Linear",onComplete:()=>{t()}})}))}))}delay(e){return new Promise((t=>setTimeout(t,e)))}handleBoomMatchFive(e,t=void 0){return new Promise((i=>{const s=null==t?this.findCenter(e,this.matchTiles):t,h=s.getBoardX()-1>=0?s.getBoardX()-1:0,l=s.getBoardX()+1<r.gridWidth?s.getBoardX()+1:r.gridWidth-1,n=s.getBoardY()-1>=0?s.getBoardY()-1:0,a=s.getBoardY()+1<r.gridHeight?s.getBoardY()+1:r.gridHeight-1,o=[];for(let t=n;t<=a;t++)for(let i=h;i<=l;i++){const s=e[t][i];if(s){const h=new Promise((e=>{s.destroyTile((()=>{e()}))}));o.push(h),e[t][i]=void 0}}const d=new Promise((t=>{e[s.getBoardY()][s.getBoardX()]=void 0,s.destroyTile((()=>{t()}))}));o.push(d),Promise.all(o).then((()=>{i()}))}))}mergeTiles(e,t,i,s=void 0){if(this.matchTiles.length<=3)return 0;let h=this.findCenter(e,this.matchTiles);const l=[],n=[],a=[];let o;this.countTiles=0;let d=!0;for(let t=0;t<this.matchTiles.length;t++){if(4==this.matchTiles[t].getMatchCount())return this.destroyAllTilesExcept(this.matchTiles[t],e),this.handleBoomMatchFour(this.matchTiles[t],e),0;if(this.matchTiles[t].getMatchCount()>=5)return this.destroyAllTilesExcept(this.matchTiles[t],e),this.handleBoomMatchFive(e,this.matchTiles[t]),0}for(let e=0;e<this.matchTiles.length;e++){const s=this.matchTiles[e];if(o&&o.getBoardY()>=s.getBoardY()&&(d=!1),s.getBoardX()==t&&s.getBoardY()==i){h=s,d=!1;break}o=s}d&&(h=this.matchTiles[this.matchTiles.length-1]);for(let e=0;e<this.matchTiles.length;e++){const t=this.matchTiles[e];t!=h&&(t.getBoardX()==h.getBoardX()||t.getBoardY()==h.getBoardY()?(l.push({x:t.getBoardX(),y:t.getBoardY()}),n.push(t)):a.push(t))}return n.forEach((t=>{h.setIsHorizontal(h.getBoardX()==t.getBoardX()),h.setMatchCount(h.getMatchCount()+t.getMatchCount()),t.setSpeed(.5),t.moveToTarget(h.getBoardX(),h.getBoardY(),(()=>{this.countTiles++,t.setVisible(!1),this.countTiles==n.length&&(l.forEach((t=>{const i=e[t.y][t.x];e[t.y][t.x]=void 0,null==i||i.destroyTile()})),s&&s())}))})),h.isColorBoom()&&("LShape"===h.getTypeOfMatch()||"CrossShape"===h.getTypeOfMatch()?h.setColorOfGlow(16711680):h.setTexture("boom")),u.getInstance().incrementScore((n.length+1)*r.addScore),h.setIsVisited(!1),h.toggleGlow(!0),1}destroyAllTilesExcept(e,t){this.matchTiles.forEach((i=>{i!=e&&(t[i.getBoardX()][i.getBoardY()]=void 0,i.destroyTile())}))}findCenter(e,t){let i=!0,s=t[0];for(let e=0;e<t.length-1;e++){for(let s=1;s<t.length-1;s++)if(t[e].getBoardX()!=t[s].getBoardX()&&t[e].getBoardY()!=t[s].getBoardY()){i=!1;break}if(i){s=t[e];break}}return s}};const m=class{constructor(e){this.matchManager=[new p],this.tileGrid=e}isMatch(e,t,i){var s,h;return e>=0&&e<r.gridHeight&&t>=0&&t<r.gridWidth&&!(null===(s=this.tileGrid[e][t])||void 0===s?void 0:s.getIsVisited())&&(null===(h=this.tileGrid[e][t])||void 0===h?void 0:h.getTypeTile())==i.getTypeTile()}checkCrossShape(e){var t,i,s,h,r,l;const n=[],a=e.getBoardY(),o=e.getBoardX();if(this.isMatch(a,o,e)){n.push({y:a,x:o}),e.setIsVisited(!0);let r=1;for(;this.isMatch(a-r,o,e);)n.push({y:a-r,x:o}),null===(t=this.tileGrid[a-r][o])||void 0===t||t.setIsVisited(!0),r++;for(r=1;this.isMatch(a+r,o,e);)n.push({y:a+r,x:o}),null===(i=this.tileGrid[a+r][o])||void 0===i||i.setIsVisited(!0),r++;for(r=1;this.isMatch(a,o-r,e);)n.push({y:a,x:o-r}),null===(s=this.tileGrid[a][o-r])||void 0===s||s.setIsVisited(!0),r++;for(r=1;this.isMatch(a,o+r,e);)n.push({y:a,x:o+r}),null===(h=this.tileGrid[a][o+r])||void 0===h||h.setIsVisited(!0),r++}if(n.length<5){for(let e=0;e<n.length;e++){const t=n[e];null===(r=this.tileGrid[t.y][t.x])||void 0===r||r.setIsVisited(!1)}return null}{let e=!1;for(let t=1;t<n.length;t++){const i=n[t],s=n[t-1];if(i.x!=s.x&&i.y!=s.y){e=!0;break}}if(e)for(let e=0;e<n.length;e++){const t=n[e];null===(l=this.tileGrid[t.y][t.x])||void 0===l||l.setTypeOfMatch("CrossShape")}return n}}checkMatchVertical(e,t){var i,s,h;const r=[],l=e.getBoardY(),n=e.getBoardX();if(this.isMatch(l,n,e)){r.push({y:l,x:n}),e.setIsVisited(!0);let t=1;for(;this.isMatch(l-t,n,e);)r.push({y:l-t,x:n}),null===(i=this.tileGrid[l-t][n])||void 0===i||i.setIsVisited(!0),t++;for(t=1;this.isMatch(l+t,n,e);)r.push({y:l+t,x:n}),null===(s=this.tileGrid[l+t][n])||void 0===s||s.setIsVisited(!0),t++}if(r.length<t){for(let e=0;e<r.length;e++){const t=r[e];null===(h=this.tileGrid[t.y][t.x])||void 0===h||h.setIsVisited(!1)}return null}return r.forEach((e=>{var t;null===(t=this.tileGrid[e.y][e.x])||void 0===t||t.setTypeOfMatch("VerticalShape")})),r}checkMatchHorizontal(e,t){var i,s,h;const r=[],l=e.getBoardY(),n=e.getBoardX();if(this.isMatch(l,n,e)){r.push({y:l,x:n}),e.setIsVisited(!0);let t=1;for(;this.isMatch(l,n-t,e);)r.push({y:l,x:n-t}),null===(i=this.tileGrid[l][n-t])||void 0===i||i.setIsVisited(!0),t++;for(t=1;this.isMatch(l,n+t,e);)r.push({y:l,x:n+t}),null===(s=this.tileGrid[l][n+t])||void 0===s||s.setIsVisited(!0),t++}if(r.length<t){for(let e=0;e<r.length;e++){const t=r[e];null===(h=this.tileGrid[t.y][t.x])||void 0===h||h.setIsVisited(!1)}return null}return r.forEach((e=>{var t;null===(t=this.tileGrid[e.y][e.x])||void 0===t||t.setTypeOfMatch("HorizontalShape")})),r}checkLShape(e){var t,i,s,h,r,l,n,a,o,d;const c=[],g=e.getBoardY(),u=e.getBoardX();if(this.isMatch(g,u,e)){c.push({y:g,x:u}),e.setIsVisited(!0);let o=1;for(;this.isMatch(g-o,u,e);)c.push({y:g-o,x:u}),null===(t=this.tileGrid[g-o][u])||void 0===t||t.setIsVisited(!0),o++;for(o=1;this.isMatch(g,u-o,e);)c.push({y:g,x:u-o}),null===(i=this.tileGrid[g][u-o])||void 0===i||i.setIsVisited(!0),o++;for(o=1;this.isMatch(g-o,u,e);)c.push({y:g-o,x:u}),null===(s=this.tileGrid[g-o][u])||void 0===s||s.setIsVisited(!0),o++;for(o=1;this.isMatch(g,u+o,e);)c.push({y:g,x:u+o}),null===(h=this.tileGrid[g][u+o])||void 0===h||h.setIsVisited(!0),o++;for(o=1;this.isMatch(g+o,u,e);)c.push({y:g+o,x:u}),null===(r=this.tileGrid[g+o][u])||void 0===r||r.setIsVisited(!0),o++;for(o=1;this.isMatch(g,u-o,e);)c.push({y:g,x:u-o}),null===(l=this.tileGrid[g][u-o])||void 0===l||l.setIsVisited(!0),o++;for(o=1;this.isMatch(g+o,u,e);)c.push({y:g+o,x:u}),null===(n=this.tileGrid[g+o][u])||void 0===n||n.setIsVisited(!0),o++;for(o=1;this.isMatch(g,u+o,e);)c.push({y:g,x:u+o}),null===(a=this.tileGrid[g][u+o])||void 0===a||a.setIsVisited(!0),o++}if(c.length<5){for(let e=0;e<c.length;e++){const t=c[e];null===(o=this.tileGrid[t.y][t.x])||void 0===o||o.setIsVisited(!1)}return null}{let e=!1;for(let t=1;t<c.length;t++){const i=c[t],s=c[t-1];if(i.x!=s.x&&i.y!=s.y){e=!0;break}}if(e)for(let e=0;e<c.length;e++){const t=c[e];null===(d=this.tileGrid[t.y][t.x])||void 0===d||d.setTypeOfMatch("LShape")}return c}}findMatches(e){let t=null;for(let t=0;t<e.length;t++)for(let i=0;i<e[t].length;i++)this.countTileLeft+=1;if(this.countTileLeft>=5)for(let i=0;i<e.length;i++){let s=!1;for(let h=0;h<e[i].length;h++){const r=e[i][h];if(r&&!r.getIsVisited()&&(t=this.checkLShape(r),null!=t&&(this.addMatch(t),this.countTileLeft<5))){s=!0;break}}if(s)break}if(this.countTileLeft>=5)for(let i=0;i<e.length;i++)for(let s=0;s<e[i].length;s++){const h=e[i][s];h&&(h.getIsVisited()||(t=this.checkCrossShape(h),null!=t&&this.addMatch(t)))}if(this.countTileLeft>=4)for(let i=0;i<e.length;i++)for(let s=0;s<e[i].length;s++){const h=e[i][s];h&&(h.getIsVisited()||(t=this.checkMatchVertical(h,4),null!=t&&this.addMatch(t)))}if(this.countTileLeft>=4)for(let i=0;i<e.length;i++)for(let s=0;s<e[i].length;s++){const h=e[i][s];h&&(h.getIsVisited()||(t=this.checkMatchHorizontal(h,4),null!=t&&this.addMatch(t)))}if(this.countTileLeft>=3)for(let i=0;i<e.length;i++)for(let s=0;s<e[i].length;s++){const h=e[i][s];h&&(h.getIsVisited()||(t=this.checkMatchVertical(h,3),null!=t&&this.addMatch(t)))}if(this.countTileLeft>=3)for(let i=0;i<e.length;i++)for(let s=0;s<e[i].length;s++){const h=e[i][s];h&&(h.getIsVisited()||(t=this.checkMatchHorizontal(h,3),null!=t&&this.addMatch(t)))}}addMatch(e){const t=new p;for(let i=0;i<e.length;i++){const s=e[i],h=this.tileGrid[s.y][s.x];t.addTile(h),this.countTileLeft-=1}this.matchManager.push(t)}refactorMatch(){for(let e=this.matchManager.length-1;e>=0;e--){const t=this.matchManager[e].getMatchTiles();3==t.length&&t[1].getBoardX()==t[2].getBoardY()&&t[1].getBoardY()==t[2].getBoardX()&&this.matchManager.splice(e,1)}for(let e=0;e<this.tileGrid.length;e++)for(let t=0;t<this.tileGrid.length;t++){const i=this.tileGrid[e][t];i&&i.setIsVisited(!1)}}matchAndRemoveTiles(e,t,i,s=void 0,h=void 0){return r=this,l=void 0,a=function*(){let r=0;0==this.matchManager.length&&h&&h();for(let h=this.matchManager.length-1;h>=0;h--){const l=this.matchManager[h].getMatchTiles();3==l.length?this.matchManager[h].destroyAllTiles(e):l.length>3&&(r+=this.matchManager[h].mergeTiles(e,t,i,(()=>{r--,0==r&&s&&s()})))}this.clear(),0==r&&s&&s()},new((n=void 0)||(n=Promise))((function(e,t){function i(e){try{h(a.next(e))}catch(e){t(e)}}function s(e){try{h(a.throw(e))}catch(e){t(e)}}function h(t){var h;t.done?e(t.value):(h=t.value,h instanceof n?h:new n((function(e){e(h)}))).then(i,s)}h((a=a.apply(r,l||[])).next())}));var r,l,n,a}clear(){this.matchManager&&this.matchManager.splice(0,this.matchManager.length)}setTileGrid(e){this.tileGrid=e,this.countTileLeft=0}},y=class{static fadeIn(e,t,i=500,s,h){return e.tweens.add({targets:t,alpha:1,duration:i,ease:s,onComplete:()=>{h&&h()}})}static fadeOutAndZoomIn(e,t,i=100,s,h,l){const n=null==h?void 0:h.x,a=null==h?void 0:h.y,o=n+.5*r.tileWidth/2,d=a+.5*r.tileHeight/2;return e.tweens.add({targets:t,alpha:0,x:o,y:d,scale:.5,duration:i,ease:s,onComplete:()=>{l&&l()}})}static moveTo(e,t,i,s,h=500,r,l,n){return e.tweens.add({targets:t,x:i,y:s,duration:h,ease:r,onComplete:()=>{l&&l()},onUpdate:()=>{n&&n()}})}static clickToScale(e,t,i,s,h,r,l=500,n,a=!1,o,d){return e.tweens.add({targets:t,x:i,y:s,scaleX:h,scaleY:r,duration:l,ease:n,yoyo:a,onComplete:()=>{o&&o()},onUpdate:()=>{d&&d()}})}static shuffleCircle(e,t,i,s,h=1500,r=!0,l=0,n,a){return e.tweens.add({targets:t,radius:i,ease:s,duration:h,yoyo:r,repeat:l,onUpdate:()=>{n&&n()},onComplete:()=>{a&&a()}})}static shuffleEllipse(e,t,i,s,h,r,l,n,a,o){return e.tweens.add({targets:t,props:{width:{value:i,ease:h},height:{value:s,ease:h}},duration:r,yoyo:l,repeat:n,onUpdate:()=>{a&&a()},onComplete:()=>{o&&o()}})}},T=class{constructor(e){this.tileGroup=new Phaser.GameObjects.Group(e),this.ellipse=new Phaser.Geom.Ellipse(r.sizeBackgroundWidth/2-r.tileWidth/2,r.sizeBackgroundHeight/2-r.tileHeight/2,200,100)}playSuffle(e,t){const i=new Phaser.Geom.Ellipse(r.sizeBackgroundWidth/2-r.tileWidth/2,r.sizeBackgroundHeight/2-r.tileHeight/2,200,100);Phaser.Actions.PlaceOnEllipse(this.tileGroup.getChildren(),i),y.shuffleEllipse(e,i,i.width+200,i.height+100,"Quintic.easeInOut",1e3,!0,0,(()=>{const e=i.x,t=i.y,s=Phaser.Math.Distance.Between(e,t,e+i.width/2,t+i.height/2);Phaser.Actions.RotateAroundDistance(this.tileGroup.getChildren(),{x:e,y:t},.05,s)}),t)}addTile(e){this.tileGroup.add(e)}removeTile(e){this.tileGroup.remove(e)}};class v extends Phaser.GameObjects.Image{constructor(e){super(e.scene,e.x,e.y,e.texture,e.frame),this.matchCount=1,this.isHorizontal=!0,this.speed=.4,this.isVisited=!1,this.setOrigin(0,0),this.setInteractive(),this.initGlow(),e.scene.add.existing(this)}setTypeOfMatch(e){this.typeOfMatch=e}getTypeOfMatch(){return this.typeOfMatch}setIsHorizontal(e){this.isHorizontal=e}getIsHorizontal(){return this.isHorizontal}setIsVisited(e){this.isVisited=e}getIsVisited(){return this.isVisited}setSpeed(e){this.speed=e}setMatchCount(e){this.matchCount=e}getMatchCount(){return this.matchCount}getTypeTile(){return this.texture.key}setColorOfGlow(e){this.glow&&(this.glow.color=e)}moveToTarget(e,t,i=void 0,s="Linear"){if(!this.scene)return;let h=Math.abs(t*r.tileHeight-this.y)/this.speed;return this.getBoardY()==t&&(h=Math.abs(e*r.tileWidth-this.x)/this.speed),this.scene.add.tween({targets:this,x:r.tileHeight*e,y:r.tileHeight*t,ease:s,duration:h,repeat:0,yoyo:!1,onComplete:()=>{i&&i()}})}initAnimationExpode(){return this.scene.add.particles(.6*this.x+r.tileWidth/2+85,.6*this.y+r.tileHeight/2+140,"flares",{frame:["red","yellow","green"],lifespan:600,speed:{min:50,max:60},scale:{start:.3*r.scale,end:0},gravityY:30,blendMode:"ADD",emitting:!1})}destroyTile(e){return new Promise((e=>{this.initAnimationExpode().explode(16),y.fadeOutAndZoomIn(this.scene,this,200,"Linear",this,(()=>{this.destroy(),e()}))}))}hasSameTypeTile(e){return this.texture.key===e.texture.key}getBoardX(){return Math.floor(this.x/r.tileWidth)}getBoardY(){return Math.floor(this.y/r.tileHeight)}test(){this.scene.add.tween({targets:this,scale:1.2,duration:1e3,ease:"Linear",yoyo:!0,repeat:-1})}toggleGlow(e){this.glow&&(this.glow.setActive(e),this.scene.tweens.add({targets:this.glow,outerStrength:10,yoyo:!0,loop:-1,ease:"sine.inout"}))}initGlow(){var e,t,i;null===(e=this.preFX)||void 0===e||e.setPadding(32),this.glow=null===(t=this.preFX)||void 0===t?void 0:t.addGlow(),null===(i=this.glow)||void 0===i||i.setActive(!1)}isColorBoom(){return this.matchCount>=5}debugTile(){console.log(this.getBoardY(),this.getBoardX(),"isVisited",this.isVisited,"texture",this.getTypeTile())}}const S=v;var x=function(e,t,i,s){return new(i||(i=Promise))((function(h,r){function l(e){try{a(s.next(e))}catch(e){r(e)}}function n(e){try{a(s.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?h(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(l,n)}a((s=s.apply(e,t||[])).next())}))};class w extends Phaser.GameObjects.Container{constructor(e,t,i){super(e,t,i),this.isPlaying=!0,this.isResetIdle=!1,this.originalPositions=[],this.idleTweens=[],this.matchManager=new m(this.tileGrid),this.timeSinceInteraction=0,this.timeSinceIdle=0,this.shuffleTiles=new T(e),this.scene.add.existing(this)}init(){this.canMove=!1,this.isPlaying=!0,this.tileGrid=[];for(let e=r.gridHeight-1;e>=0;e--)for(let t=0;t<r.gridWidth;t++){const i=this.scene.add.image(t*r.tileWidth,e*r.tileHeight,"ground").setOrigin(0).setScale(.4);this.add(i)}for(let e=r.gridHeight-1;e>=0;e--){this.tileGrid[e]=[];for(let t=0;t<r.gridWidth;t++){const i=this.addTile(t,e);this.tileGrid[e][t]=i,this.shuffleTiles.addTile(i)}}this.shuffleTiles.playSuffle(this.scene,(()=>{let e=r.gridWidth*r.gridHeight;this.canMove=!1;for(let t=r.gridHeight-1;t>=0;t--)for(let i=0;i<r.gridWidth;i++){const s=t*r.tileHeight+r.tileHeight*(r.gridHeight-t);y.moveTo(this.scene,this.tileGrid[t][i],i*r.tileWidth,t*r.tileHeight,s,"Linear",(()=>{e--,0==e&&(this.resetTimeHintAndIdle(),this.checkMatches())}))}})),this.firstSelectedTile=void 0,this.secondSelectedTile=void 0,this.scene.input.on("gameobjectdown",this.tileSelect,this),this.scene.input.on("pointermove",this.startSwipe,this),this.scene.input.on("pointerup",this.stopSwipe,this)}restart(){return x(this,void 0,void 0,(function*(){return this.destroyAllTiles((()=>{})).then((()=>{this.init()})).then((()=>{this.isPlaying=!0}))}))}setIsPlaying(e){this.isPlaying=e}preUpdate(e,t){this.canMove&&(this.timeSinceInteraction+=t,this.timeSinceIdle+=t,this.timeSinceInteraction>=r.delayShowIdle&&(this.triggerIdle(),this.timeSinceInteraction=0),this.timeSinceIdle>=r.delayShowHint&&(this.removeHint(),this.showHint(),this.timeSinceIdle=0))}triggerIdle(){this.isResetIdle=!0;let e=0;this.originalPositions=[],this.idleTweens.forEach((e=>e.stop())),this.idleTweens=[];for(let t=0;t<=r.gridHeight+r.gridWidth-2;t++)for(let i=Math.min(t,r.gridHeight-1);i>=Math.max(0,t-r.gridWidth+1);i--){const s=t-i,h=this.tileGrid[i][s];if(h){this.originalPositions.push({tile:h,x:h.x,y:h.y});const t=this.scene.tweens.add({targets:h,alpha:.5,y:h.y+10,duration:200,ease:"Linear",yoyo:!0,delay:20*e});this.idleTweens.push(t),e++}}}resetIdle(){this.idleTweens.forEach((e=>e.stop())),this.originalPositions.forEach((({tile:e,x:t,y:i})=>{this.scene.tweens.add({targets:e,alpha:1,x:t,y:i,duration:0,ease:"Linear"})}))}removeIdleAnimations(){for(let e=0;e<r.gridHeight;e++)for(let t=0;t<r.gridWidth;t++){const i=this.tileGrid[e][t];i&&(this.scene.tweens.killTweensOf(i),i.setAlpha(1))}}showHint(){let e=!1;for(let t=0;t<r.gridHeight;t++)for(let i=0;i<r.gridWidth;i++){if(e)return;if(i<r.gridWidth-1){if(this.swapTilesInGrid(i,t,i+1,t),this.hasMatchAfterSwap()){this.highlightTile(i,t),this.highlightTile(i+1,t),this.swapTilesInGrid(i,t,i+1,t),e=!0;continue}this.swapTilesInGrid(i,t,i+1,t)}if(t<r.gridHeight-1){if(this.swapTilesInGrid(i,t,i,t+1),this.hasMatchAfterSwap()){this.highlightTile(i,t),this.highlightTile(i,t+1),this.swapTilesInGrid(i,t,i,t+1),e=!0;continue}this.swapTilesInGrid(i,t,i,t+1)}}e||this.restart()}highlightTile(e,t){const i=this.tileGrid[t][e];if(i){const e=this.scene.add.image(i.x,i.y,"selection-frame").setOrigin(0);i.setData("selectionImage",e),this.add(e);const t=i.x,s=i.y,h=t-.2*r.tileWidth/2,l=s-.2*r.tileHeight/2;this.scene.tweens.add({targets:e,x:h,y:l,scaleX:1.2,scaleY:1.2,duration:200,ease:"Linear",yoyo:!0,repeat:-1})}}swapTilesInGrid(e,t,i,s){const h=this.tileGrid[t][e];this.tileGrid[t][e]=this.tileGrid[s][i],this.tileGrid[s][i]=h}hasMatchAfterSwap(){return this.getMatches(this.tileGrid).length>0}removeHint(){for(let e=0;e<r.gridHeight;e++)for(let t=0;t<r.gridWidth;t++){const i=this.tileGrid[e][t];if(i){const e=i.getData("selectionImage");e&&(1===e.scaleX&&1===e.scaleY||(this.scene.tweens.killTweensOf(e),e.setScale(1)),e.destroy(),i.setData("selectionImage",null))}}}tileSelect(e,t){var i;if(this.canMove){this.canDrag=!0,this.resetTimeHintAndIdle(),this.removeIdleAnimations(),this.removeHint(),this.isResetIdle&&(this.isResetIdle=!1,this.resetIdle()),this.firstSelectedTile&&this.scene.tweens.killTweensOf(this.firstSelectedTile),this.secondSelectedTile&&this.scene.tweens.killTweensOf(this.secondSelectedTile);const e=Math.floor(t.y/r.tileHeight),s=Math.floor(t.x/r.tileWidth);if(e>=r.gridHeight||s>=r.gridWidth||e<0||s<0)return;const h=this.tileGrid[e][s];if(null!=h)if(null==this.firstSelectedTile)this.firstSelectedTile=h,this.canMove=!1,this.clickEffect(this.firstSelectedTile,(()=>{this.canMove=!0,this.canDrag=!0}),(()=>{this.canDrag=!1}));else{if(this.secondSelectedTile=h,this.firstSelectedTile==this.secondSelectedTile)return void this.tileUp();{const e=Math.abs(this.firstSelectedTile.x-this.secondSelectedTile.x)/r.tileWidth,t=Math.abs(this.firstSelectedTile.y-this.secondSelectedTile.y)/r.tileHeight;1===e&&0===t||0===e&&1===t?(this.canMove=!1,null===(i=this.currentSelectionImage)||void 0===i||i.destroy(),this.currentSelectionImage=void 0,this.swapTiles()):(this.tileUp(),this.firstSelectedTile=h,this.canMove=!1,this.clickEffect(this.firstSelectedTile,(()=>{this.canMove=!0,this.canDrag=!0}),(()=>{this.canDrag=!1})))}}}}startSwipe(e){var t;if(this.canDrag&&null!=this.firstSelectedTile){this.resetTimeHintAndIdle();const i=e.downX-e.x,s=e.downY-e.y;let h=0,l=0;if(i>r.tileWidth*r.scale/2&&Math.abs(s)<r.tileWidth*r.scale/4?l=-1:i<-r.tileWidth*r.scale/2&&Math.abs(s)<r.tileWidth*r.scale/4?l=1:s>r.tileHeight*r.scale/2&&Math.abs(i)<r.tileHeight*r.scale/4?h=-1:s<-r.tileHeight*r.scale/2&&Math.abs(i)<r.tileHeight*r.scale/4&&(h=1),0!==h||0!==l){const e=this.getTileRow(this.firstSelectedTile)+h,i=this.getTileCol(this.firstSelectedTile)+l;e>=0&&e<r.gridHeight&&i>=0&&i<r.gridWidth&&(this.secondSelectedTile=this.tileGrid[e][i],null!=this.secondSelectedTile&&(null===(t=this.currentSelectionImage)||void 0===t||t.destroy(),this.currentSelectionImage=void 0,this.swapTiles(),this.canDrag=!1))}}}stopSwipe(){this.canDrag=!1}getTileRow(e){return Math.floor(e.y/r.tileHeight)}getTileCol(e){return Math.floor(e.x/r.tileWidth)}clickEffect(e,t,i){const s=e.x,h=e.y,l=s-.2*r.tileWidth/2,n=h-.2*r.tileHeight/2;y.clickToScale(this.scene,e,l,n,1.2,1.2,200,"Linear",!0,t,i),this.currentSelectionImage=this.scene.add.image(e.x,e.y,"selection-frame").setOrigin(0),e.setData("selectionImage",this.currentSelectionImage),this.add(this.currentSelectionImage),this.scene.tweens.add({targets:this.currentSelectionImage,x:l,y:n,scaleX:1.2,scaleY:1.2,duration:200,ease:"Linear",yoyo:!0,repeat:-1})}addTile(e,t){const i=r.candyTypes[Phaser.Math.RND.between(0,r.candyTypes.length-1)],s=new S({scene:this.scene,x:e*r.tileWidth,y:t*r.tileHeight,texture:i});return this.add(s),s}swapTiles(){return x(this,void 0,void 0,(function*(){if(this.firstSelectedTile&&this.secondSelectedTile){this.scene.tweens.killTweensOf(this.firstSelectedTile),this.scene.tweens.killTweensOf(this.secondSelectedTile);const e={x:this.firstSelectedTile.x,y:this.firstSelectedTile.y},t={x:this.secondSelectedTile.x,y:this.secondSelectedTile.y};this.tileGrid[e.y/r.tileHeight][e.x/r.tileWidth]=this.secondSelectedTile,this.tileGrid[t.y/r.tileHeight][t.x/r.tileWidth]=this.firstSelectedTile,y.moveTo(this.scene,this.firstSelectedTile,this.secondSelectedTile.x,this.secondSelectedTile.y,r.swapSpeed,"Linear"),y.moveTo(this.scene,this.secondSelectedTile,this.firstSelectedTile.x,this.firstSelectedTile.y,r.swapSpeed,"Linear",(()=>{var e,t,i,s,h,r;(null===(e=this.firstSelectedTile)||void 0===e?void 0:e.isColorBoom())?"LShape"===(null===(t=this.firstSelectedTile)||void 0===t?void 0:t.getTypeOfMatch())||"CrossShape"===(null===(i=this.firstSelectedTile)||void 0===i?void 0:i.getTypeOfMatch())?this.checkMatches():this.explodeSameTile(this.firstSelectedTile,this.secondSelectedTile):(null===(s=this.secondSelectedTile)||void 0===s?void 0:s.isColorBoom())?"LShape"===(null===(h=this.secondSelectedTile)||void 0===h?void 0:h.getTypeOfMatch())||"CrossShape"===(null===(r=this.secondSelectedTile)||void 0===r?void 0:r.getTypeOfMatch())?this.checkMatches():this.explodeSameTile(this.secondSelectedTile,this.firstSelectedTile):this.checkMatches()}),(()=>{this.canMove=!1})),this.firstSelectedTile=this.tileGrid[e.y/r.tileHeight][e.x/r.tileWidth],this.secondSelectedTile=this.tileGrid[t.y/r.tileHeight][t.x/r.tileWidth]}}))}explodeSameTile(e,t){var i,s;return x(this,void 0,void 0,(function*(){for(let e=0;e<this.tileGrid.length;e++)for(let h=0;h<this.tileGrid[e].length;h++)if(null===(i=this.tileGrid[e][h])||void 0===i?void 0:i.hasSameTypeTile(t))if(4==(null===(s=this.tileGrid[e][h])||void 0===s?void 0:s.getMatchCount()))this.handleBoomMatchFour(this.tileGrid[e][h],this.tileGrid);else{const t=this.tileGrid[e][h];this.tileGrid[e][h]=void 0,null==t||t.destroyTile()}this.tileGrid[e.getBoardY()][e.getBoardX()]=void 0,e.destroyTile(),yield this.resetTile(),yield this.tileUp(),yield this.checkMatches()}))}handleBoomMatchFour(e,t){if(e.getIsHorizontal())for(let i=0;i<r.gridWidth;i++){const s=t[e.getBoardY()][i];t[e.getBoardY()][i]=void 0,null==s||s.destroyTile(),u.getInstance().eventEmitter.emit("addScore",r.addScore)}else for(let i=0;i<r.gridHeight;i++){const s=t[i][e.getBoardX()];t[i][e.getBoardX()]=void 0,null==s||s.destroyTile(),u.getInstance().eventEmitter.emit("addScore",r.addScore)}t[e.getBoardY()][e.getBoardX()]=void 0,e.destroyTile()}checkMatches(){return x(this,void 0,void 0,(function*(){const e=this.getMatches(this.tileGrid);e.length>0?(yield this.removeTileGroup(e),this.canMove=!0):(yield this.swapTiles(),yield this.tileUp(),this.canMove=!0)}))}resetTile(){return x(this,void 0,void 0,(function*(){const e=new Map;for(let t=0;t<this.tileGrid.length;t++)for(let i=0;i<this.tileGrid[t].length;i++)if(this.tileGrid[t][i]&&t+1<this.tileGrid.length&&void 0===this.tileGrid[t+1][i])if(e.has(i)){const s=e.get(i);s&&(s[0]=t)}else e.set(i,[t,-1]);else if(void 0===this.tileGrid[t][i])if(e.has(i)){const s=e.get(i);s&&(s[1]=t)}else e.set(i,[-1,t]);const t=[];e.forEach(((e,i)=>{let s=e[1];for(let h=e[0];h>=0;h--){if(null==this.tileGrid[h][i])continue;const e=r.tileHeight*(s-h)/r.fallSpeed;t.push(this.tweenTile(this.tileGrid[h][i],i,s,e));const l=this.tileGrid[h][i];this.tileGrid[h][i]=this.tileGrid[s][i],this.tileGrid[s][i]=l,s--}for(let e=s;e>=0;e--){const h=e-s-1,l=this.addTile(i,h),n=r.tileHeight*(s+1)/r.fallSpeed;t.push(this.tweenTile(l,i,e,n)),this.tileGrid[e][i]=l}})),yield Promise.all(t)}))}tweenTile(e,t,i,s){return new Promise((h=>{y.moveTo(this.scene,e,t*r.tileWidth,i*r.tileHeight,s,"Bounce.easeOut",(()=>{h()}))}))}tileUp(){var e;return x(this,void 0,void 0,(function*(){this.firstSelectedTile=void 0,this.secondSelectedTile=void 0,null===(e=this.currentSelectionImage)||void 0===e||e.destroy(),this.currentSelectionImage=void 0}))}removeTileGroup(e){return x(this,void 0,void 0,(function*(){return new Promise(((t,i)=>{var s,h;this.tileGrid?(this.matchManager.clear(),this.matchManager.setTileGrid(this.tileGrid),this.matchManager.findMatches(e),this.matchManager.refactorMatch(),this.matchManager.matchAndRemoveTiles(this.tileGrid,null===(s=this.secondSelectedTile)||void 0===s?void 0:s.getBoardX(),null===(h=this.secondSelectedTile)||void 0===h?void 0:h.getBoardY(),(()=>x(this,void 0,void 0,(function*(){this.isPlaying&&(this.canMove=!1,yield this.resetTile(),yield this.tileUp(),yield this.checkMatches()),t()}))),(()=>{console.log("Something went wrong"),this.checkMatches(),t()}))):t()}))}))}getMatches(e){var t,i,s,h,r,l,n,a;const o=[];let d=[];for(let r=0;r<e.length;r++){const l=e[r];d=[];for(let n=0;n<l.length;n++)n<l.length-2&&e[r][n]&&e[r][n+1]&&e[r][n+2]&&(null===(t=e[r][n])||void 0===t?void 0:t.texture.key)===(null===(i=e[r][n+1])||void 0===i?void 0:i.texture.key)&&(null===(s=e[r][n+1])||void 0===s?void 0:s.texture.key)===(null===(h=e[r][n+2])||void 0===h?void 0:h.texture.key)&&(d.length>0&&-1==d.indexOf(e[r][n])&&(o.push(d),d=[]),-1==d.indexOf(e[r][n])&&d.push(e[r][n]),-1==d.indexOf(e[r][n+1])&&d.push(e[r][n+1]),-1==d.indexOf(e[r][n+2])&&d.push(e[r][n+2]));d.length>0&&o.push(d)}for(let t=0;t<e.length;t++){const i=e[t];d=[];for(let s=0;s<i.length;s++)s<i.length-2&&e[s][t]&&e[s+1][t]&&e[s+2][t]&&(null===(r=e[s][t])||void 0===r?void 0:r.texture.key)===(null===(l=e[s+1][t])||void 0===l?void 0:l.texture.key)&&(null===(n=e[s+1][t])||void 0===n?void 0:n.texture.key)===(null===(a=e[s+2][t])||void 0===a?void 0:a.texture.key)&&(d.length>0&&-1==d.indexOf(e[s][t])&&(o.push(d),d=[]),-1==d.indexOf(e[s][t])&&d.push(e[s][t]),-1==d.indexOf(e[s+1][t])&&d.push(e[s+1][t]),-1==d.indexOf(e[s+2][t])&&d.push(e[s+2][t]));d.length>0&&o.push(d)}return o}resetTimeHintAndIdle(){this.timeSinceInteraction=0,this.timeSinceIdle=0}destroyAllTiles(e){return new Promise((t=>{var i,s;for(let e=0;e<this.tileGrid.length;e++)for(let t=0;t<this.tileGrid[e].length;t++)this.tileGrid[e][t]&&(null===(i=this.tileGrid[e][t])||void 0===i||i.destroy());this.tileGrid=[],null===(s=this.currentSelectionImage)||void 0===s||s.destroy(),this.currentSelectionImage=void 0,this.firstSelectedTile=void 0,this.secondSelectedTile=void 0,this.resetTimeHintAndIdle(),e&&e(),t()}))}}const M=w;class I extends Phaser.GameObjects.Container{constructor(e,t,i,s){super(e,t,i),this.targetScore=s,this.currentScore=0,this.progressBar=new Phaser.GameObjects.Image(e,60,58,"bar_1").setOrigin(0,0),this.progressFill=new Phaser.GameObjects.Image(e,63,61,"bar_2").setOrigin(0,0),this.boardTarget=new Phaser.GameObjects.Image(e,320,20,"f").setOrigin(0,0),this.targetText=e.add.text(348,35,"Target",{fontFamily:"Arial",fontSize:"28px",color:"#ff4500",strokeThickness:6}),this.targetText.setOrigin(0,0),this.targetScoreText=e.add.text(357,70,`${s}`,{fontFamily:"Arial",fontSize:"28px",color:"#ff4500",strokeThickness:6}),this.targetScoreText.setOrigin(0,0),this.scoreText=e.add.text(150,90,`${this.currentScore}`,{fontFamily:"Arial",fontSize:"26px",color:"#ff4500",strokeThickness:6}),this.emitter=this.scene.add.particles(this.progressFill.x,this.progressFill.y,"flares",{y:{min:0,max:22},frame:["red","yellow","green"],lifespan:300,speedX:{min:-150,max:0},scale:{start:.2,end:0},blendMode:"ADD"}),this.progressBar.setScale(.11),this.progressFill.setScale(.107,.09),this.boardTarget.setScale(.09),this.add(this.boardTarget),this.add(this.progressBar),this.add(this.progressFill),this.add(this.targetText),this.add(this.targetScoreText),this.add(this.scoreText),this.add(this.emitter),e.add.existing(this)}updateScore(e){this.currentScore=e,this.scoreText.setText(`${this.currentScore}`)}setTargetScore(e){this.targetScore=e,this.targetScoreText.setText(`${this.targetScore}`)}setProgressBarValue(e){const t=.107*e;this.scene.add.tween({targets:this.progressFill,scaleX:t,ease:"Linear",duration:1e3,repeat:0,yoyo:!1,onUpdate:()=>{this.emitter.x=this.progressFill.x+this.progressFill.displayWidth,0==e?this.emitter.stop():this.emitter.start()}})}}const G=I;class B extends Phaser.GameObjects.Container{constructor(e,t,i){super(e,t,i),this.init(),e.add.existing(this)}init(){this.popUpBackground=new Phaser.GameObjects.Image(this.scene,0,0,"f").setOrigin(0),this.popUpBackground.setScale(.2),this.field=new Phaser.GameObjects.Image(this.scene,0,0,"field").setOrigin(0),this.field.setScale(.25),this.field.setPosition(this.popUpBackground.displayWidth/2-this.field.displayWidth/2,this.popUpBackground.displayHeight/1.6),this.jellyYellow=new Phaser.GameObjects.Image(this.scene,0,0,"jellyYellow").setOrigin(0),this.jellyYellow.setScale(.8),this.jellyYellow.setPosition(this.popUpBackground.displayWidth/2-this.jellyYellow.displayWidth/2,this.popUpBackground.displayHeight/2-this.jellyYellow.displayHeight/2),this.jellyRed=new Phaser.GameObjects.Image(this.scene,0,0,"jellyRed").setOrigin(0),this.jellyRed.setScale(.8),this.jellyRed.setPosition(this.field.x,this.popUpBackground.displayHeight/2-this.jellyRed.displayHeight/2),this.jellyGreen=new Phaser.GameObjects.Image(this.scene,0,0,"jellyGreen").setOrigin(0),this.jellyGreen.setScale(.8),this.jellyGreen.setPosition(this.field.x+this.field.displayWidth-this.jellyGreen.displayWidth,this.popUpBackground.displayHeight/2-this.jellyGreen.displayHeight/2),this.contentText=this.scene.add.text(32,30,"LEVEL COMPLETE",{fontFamily:"Arial",fontSize:"28px",color:"#ff4500",strokeThickness:6}),this.scoreText=this.scene.add.text(0,0,`Score: ${u.getInstance().getCurrentScore()}`,{fontFamily:"Arial",fontSize:"28px",color:"#ff4500",strokeThickness:6}),this.scoreText.setPosition(this.popUpBackground.displayWidth/2-this.scoreText.width/2,this.popUpBackground.displayHeight/2+this.scoreText.height-4),this.add(this.popUpBackground),this.add(this.field),this.add(this.jellyYellow),this.add(this.jellyGreen),this.add(this.jellyRed),this.add(this.contentText),this.add(this.scoreText)}}const P=B;class k extends Phaser.GameObjects.Container{constructor(e,t,i){super(e,t,i),this.overlay=this.scene.add.graphics(),this.overlay.fillStyle(0,.7),this.overlay.fillRect(0,0,this.scene.game.config.width,this.scene.game.config.height),this.overlay.setDepth(1),this.add(this.overlay),e.add.existing(this)}}const H=k;class O extends Phaser.Scene{constructor(){super({key:"GameScene"}),this.isPlaying=!0,u.getInstance().eventEmitter.on("addScore",(e=>{this.addScoreAndUpdateMainUI(e)})),u.getInstance().eventEmitter.on("reachTargetScore",(()=>{this.updateNewRound()}))}init(){this.background=new c(this,0,0),this.gameBoard=new M(this,100,150),this.gameBoard.init(),this.gameBoard.setScale(r.scale),this.mainUI=new G(this,0,0,u.getInstance().getTargetScore()),this.mainUI.setProgressBarValue(u.getInstance().getProgressRatio()),this.confettiParticleLeftManager=new o(this,260,320),this.confettiParticleRightManager=new o(this,210,270),this.confettiParticleLeftManager.burst(60,300),this.confettiParticleRightManager.burst(480,300)}addScoreAndUpdateMainUI(e){if(this.isPlaying){u.getInstance().incrementScore(e);const t=u.getInstance().getProgressRatio();this.mainUI.updateScore(u.getInstance().getCurrentScore()),this.mainUI.setProgressBarValue(t)}}updateNewRound(){return e=this,t=void 0,s=function*(){return new Promise((e=>{this.milestonesUI=new P(this,0,0),this.milestonesUI.setPosition(r.sizeBackgroundWidth*r.scale/2-60,r.sizeBackgroundHeight*r.scale/2).setDepth(2),this.overlay=new H(this,0,0),u.getInstance().resetScore(),this.mainUI.updateScore(u.getInstance().getCurrentScore()),this.mainUI.setProgressBarValue(u.getInstance().getProgressRatio()),this.isPlaying=!1,this.gameBoard.setIsPlaying(!1),this.confettiParticleLeftManager.burst(60,300),this.confettiParticleRightManager.burst(480,300),e()})).then((()=>{setTimeout((()=>{this.milestonesUI.destroy(),this.overlay.destroy(),this.gameBoard.restart();const e=u.getInstance().getTargetScore()+1e3;u.getInstance().setTargetScore(e),this.mainUI.setTargetScore(e),this.isPlaying=!0}),2e3)}))},new((i=void 0)||(i=Promise))((function(h,r){function l(e){try{a(s.next(e))}catch(e){r(e)}}function n(e){try{a(s.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?h(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(l,n)}a((s=s.apply(e,t||[])).next())}));var e,t,i,s}}const b={title:"Candy crush",url:"https://github.com/digitsensitive/phaser3-typescript",version:"0.0.1",width:r.sizeBackgroundWidth,height:r.sizeBackgroundHeight,type:Phaser.AUTO,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.Center.CENTER_BOTH},parent:"game",scene:[l,O],render:{pixelArt:!1,antialias:!0}};class C extends Phaser.Game{constructor(e){super(e)}}window.addEventListener("load",(()=>{new C(b)}))}},i={};function s(e){var h=i[e];if(void 0!==h)return h.exports;var r=i[e]={exports:{}};return t[e].call(r.exports,r,r.exports,s),r.exports}s.m=t,e=[],s.O=(t,i,h,r)=>{if(!i){var l=1/0;for(d=0;d<e.length;d++){for(var[i,h,r]=e[d],n=!0,a=0;a<i.length;a++)(!1&r||l>=r)&&Object.keys(s.O).every((e=>s.O[e](i[a])))?i.splice(a--,1):(n=!1,r<l&&(l=r));if(n){e.splice(d--,1);var o=h();void 0!==o&&(t=o)}}return t}r=r||0;for(var d=e.length;d>0&&e[d-1][2]>r;d--)e[d]=e[d-1];e[d]=[i,h,r]},s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var i in t)s.o(t,i)&&!s.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={792:0};s.O.j=t=>0===e[t];var t=(t,i)=>{var h,r,[l,n,a]=i,o=0;if(l.some((t=>0!==e[t]))){for(h in n)s.o(n,h)&&(s.m[h]=n[h]);if(a)var d=a(s)}for(t&&t(i);o<l.length;o++)r=l[o],s.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return s.O(d)},i=self.webpackChunktype_project_template=self.webpackChunktype_project_template||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))})();var h=s.O(void 0,[96],(()=>s(325)));h=s.O(h)})();