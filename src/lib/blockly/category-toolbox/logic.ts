import { customKey } from '@/lib/blockly/i18n/zh'

export default {
  kind: 'category',
  name: customKey.TOOLBOX_LOGIC,
  cssConfig: {
    container: 'category-logic',
  },
  contents: [
    // {
    //   kind: 'block',
    //   type: 'logic_boolean',
    // },
    {
      kind: 'block',
      type: 'controls_if',
    },
    {
      kind: 'block',
      type: 'controls_ifelse',
    },
    {
      kind: 'block',
      type: 'logic_compare',
    },
    {
      kind: 'block',
      type: 'logic_operation',
    },
    {
      kind: 'block',
      type: 'logic_negate',
    },
    // {
    //   kind: 'block',
    //   type: 'logic_null',
    // },
    // {
    //   kind: 'block',
    //   type: 'logic_ternary',
    // },
    // {
    //   kind: 'block',
    //   type: 'controls_if_if',
    // },
    // {
    //   kind: 'block',
    //   type: 'controls_if_elseif',
    // },
    // {
    //   kind: 'block',
    //   type: 'controls_if_else',
    // },
  ],
}
