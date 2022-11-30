import {
  Layouts as Layout,
  registerLayout as onRegisterLayout,
  RandomLayout
} from '@cc/layout'

const registerLayout = (name: string, layoutOverride: any) => {
  layoutOverride.isCustomLayout = true
  Layout[name] = onRegisterLayout(name, layoutOverride)
}

onRegisterLayout('random', RandomLayout)

export { Layout, registerLayout }