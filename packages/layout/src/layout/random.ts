import { PointTuple, OutNode, RandomLayoutOptions } from '../types'
 import { Base } from './base'
 
 /**
  * 随机布局
  */
 export class RandomLayout extends Base {
   /** 布局中心 */
   public center: PointTuple = [0, 0]
 
   /** 宽度 */
   public width: number = 300
 
   /** 高度 */
   public height: number = 300
 
   public nodes: OutNode[] = []
 
 
   /** 迭代结束的回调函数 */
   public onLayoutEnd: () => void = () => {}
 
   constructor(options?: RandomLayoutOptions) {
     super()
     this.updateCfg(options)
   }
 
   public getDefaultCfg() {
     return {
       center: [0, 0],
       width: 300,
       height: 300
     }
   }
 
   /**
    * 执行布局
    */
   public execute() {
     const nodes = this.nodes
     const layoutScale = 0.9
     const center = this.center
     if (!this.width && typeof window !== 'undefined') {
       this.width = window.innerWidth
     }
     if (!this.height && typeof window !== 'undefined') {
       this.height = window.innerHeight
     }
 
     if (nodes) {
       nodes.forEach((node) => {
         node.x = (Math.random() - 0.5) * layoutScale * this.width + center[0]
         node.y = (Math.random() - 0.5) * layoutScale * this.height + center[1]
       })
     }
 
     if (this.onLayoutEnd) this.onLayoutEnd()
 
     return {
       nodes
     }
   }
 
   public getType() {
     return 'random'
   }
 }
 