
// // todo: blockly 类型
import * as Blockly from 'blockly/core'

// import { defineBlocksWithJsonArray, Blocks, Msg, Mutator } from 'blockly/core'
import { javascriptGenerator } from 'blockly/javascript'
import './custom-field/field_light'
import '../block-js-code/light'
import { customKey } from '@/lib/blockly/i18n/zh'

Blockly.defineBlocksWithJsonArray([
  {
    type: 'set_light_by_ui',
    // message0: 'set lights with array %1',
    message0: customKey.LIGHT_SET_BY_UI,
    args0: [
      {
        type: 'field_light',
        name: 'light',
      },
    ],
    colour: 230,
    tooltip: '',
    helpUrl: '',
    previousStatement: null,
    nextStatement: null,
  },
  {
    type: 'set_light',
    // message0: 'set lights with array %1',
    message0: customKey.LIGHT_SET_BY_ARRAY,
    args0: [
      {
        type: 'field_variable',
        name: 'light',
        variable: 'item',
      },
    ],
    colour: 230,
    tooltip: '',
    helpUrl: '',
    previousStatement: null,
    nextStatement: null,
  },
  {
    type: 'set_all_light',
    // message0: 'set lights with color %1',
    message0: customKey.LIGHT_SET_ALL_BY_COLOR,
    args0: [
      {
        type: 'input_value',
        name: 'color',
        // text: '0xffffff',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: '',
    helpUrl: '',
  },
  {
    type: 'set_all_light_color',
    // message0: 'set lights with color R: %1 G: %2 B: %3',
    message0: customKey.LIGHT_SET_ALL_BY_RGB,
    args0: [
      {
        // type: 'field_number',
        type: 'input_value',
        name: 'R',
        // value: 0,
        // min: 0, // todo: 在输入端做限制
        // max: 255,
        // precision: 1,
      },
      {
        type: 'input_value',
        name: 'G',
        // value: 0,
        // min: 0,
        // max: 255,
        // precision: 1,
      },
      {
        type: 'input_value',
        name: 'B',
        // value: 0,
        // min: 0,
        // max: 255,
        // precision: 1,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: '',
    helpUrl: '',
  },
  {
    type: 'set_light_animation',
    // message0: 'set light animation %1 last %2 seconds with color %3',
    message0: customKey.LIGHT_SET_ANIMATION,
    args0: [
      {
        type: 'field_dropdown',
        name: 'animation',
        options: [
          [
            customKey.LIGHT_RUN,
            'run',
          ],
          [
            customKey.LIGHT_BREATH,
            'breath',
          ],
          [
            customKey.LIGHT_BLINK,
            'star',
          ],
          [
            customKey.LIGHT_BOOM,
            'boom',
          ],
          // [
          //   '五彩斑斓',
          //   'color',
          // ],
        ],
      },
      {
        // type: 'field_number',
        type: 'input_value',
        name: 'time',
        value: 0,
        min: 0,
      },
      {
        // type: 'field_input',
        type: 'input_value',
        name: 'color',
        text: '0xffffff',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: '',
    helpUrl: '',
  },
  {
    type: 'clear_light',
    // message0: 'clear all light',
    message0: customKey.LIGHT_CLEAR_ALL,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: '',
    helpUrl: '',
  },
])

Blockly.Blocks.lists_create_with_row = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Block}
   */
  init: function () {
    this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL)
    this.setStyle('list_blocks')
    this.itemCount_ = 3
    this.updateShape_()
    this.setOutput(true, 'Array')
    this.setInputsInline(true)
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']))
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP)
  },
  /**
   * Create XML to represent list inputs.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement('mutation') // todo
    container.setAttribute('items', this.itemCount_)
    return container
  },
  /**
   * Parse XML to restore the list inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function (xmlElement: any) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10)
    this.updateShape_()
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function () {
    return {
      itemCount: this.itemCount_,
    }
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state: any) {
    this.itemCount_ = state.itemCount
    this.updateShape_()
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function (workspace: any) {
    const containerBlock = workspace.newBlock('lists_create_with_container')
    containerBlock.initSvg()
    let connection = containerBlock.getInput('STACK').connection
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock('lists_create_with_item')
      itemBlock.initSvg()
      connection.connect(itemBlock.previousConnection)
      connection = itemBlock.nextConnection
    }
    return containerBlock
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  compose: function (containerBlock: any) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK')
    // Count number of inputs.
    const connections = []
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_)
      itemBlock =
        itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput('ADD' + i).connection.targetConnection
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect()
      }
    }
    this.itemCount_ = connections.length
    this.updateShape_()
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i)
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  saveConnections: function (containerBlock: any) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK')
    let i = 0
    while (itemBlock) {
      const input = this.getInput('ADD' + i)
      itemBlock.valueConnection_ = input && input.connection.targetConnection
      itemBlock =
        itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      i++
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY')
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY').appendField(
        Blockly.Msg.LISTS_CREATE_EMPTY_TITLE)
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        const input = this.appendValueInput('ADD' + i).setAlign(Blockly.ALIGN_RIGHT) // todo
        if (i === 0) {
          input.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH)
        }
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
      this.removeInput('ADD' + i)
    }
  },
}

// javascriptGenerator.set_light_by_ui = function (block: any) {
//   const arr_light = block.getFieldValue('light')
//   return 'bleSetLight(JSON.stringify({colors:' + JSON.stringify(arr_light) + ',bright:1}));\n'
//   // return '\n'
// }

// javascriptGenerator.set_light = function (block: any) {
//   const variable_light = javascriptGenerator.nameDB_.getName(block.getFieldValue('light'), 'VARIABLE')

//   return 'bleSetLight(JSON.stringify({colors:' + variable_light + ',bright:1}));\n'
//   // return 'bleSetLight(JSON.stringify({colors:' + variable_light + '.map(function (e) {' +
//   //   "if (typeof (e) === 'string') {" +
//   //   "e = e.replace('#', '')" +
//   //   '}' +
//   //   'return Number(e);' +
//   //   '}),bright:1}));\n'
// }

// javascriptGenerator.set_all_light = function (block: any) {
//   const number_color = block.getFieldValue('color')
//   console.log(number_color)
//   const arr = JSON.parse(JSON.stringify(Array(12).fill(Number(number_color))))

//   return 'bleSetLight(JSON.stringify({colors:[' + arr + '],bright:1}));\n'
// }

// javascriptGenerator.lists_create_with_row = function (block: any) {
//   // Create a list with any number of elements of any type.
//   const elements = new Array(block.itemCount_)
//   for (let i = 0; i < block.itemCount_; i++) {
//     elements[i] =
//       javascriptGenerator.valueToCode(block, 'ADD' + i, javascriptGenerator.ORDER_NONE) ||
//       'null'
//   }
//   const code = '[' + elements.join(', ') + ']'
//   return [code, javascriptGenerator.ORDER_ATOMIC]
// }

// javascriptGenerator.list_include = function (block: any) {
//   const variable_list = javascriptGenerator.nameDB_.getName(block.getFieldValue('list'), 'VARIABLE')
//   const variable_name = javascriptGenerator.nameDB_.getName(block.getFieldValue('NAME'), 'VARIABLE')
//   // TODO: Assemble JavaScript into code variable.
//   const code = `${variable_list}.indexOf(${variable_name}) >= 0`
//   // TODO: Change ORDER_NONE to the correct strength.
//   return [code, javascriptGenerator.ORDER_NONE]
// }

// javascriptGenerator.set_all_light_color = function (block: any) {
//   const number_r = block.getFieldValue('R')
//   const number_g = block.getFieldValue('G')
//   const number_b = block.getFieldValue('B')

//   const arr = JSON.parse(JSON.stringify(Array(12).fill(number_r * 256 * 256 + number_g * 256 + number_b)))

//   return 'bleSetLight(JSON.stringify({colors:[' + arr + '],bright:1}));\n'
// }

// javascriptGenerator.set_light_animation = function (block: any) {
//   const dropdown_animation = block.getFieldValue('animation')
//   const number_name = block.getFieldValue('NAME')
//   const text_color = block.getFieldValue('color')
//   // TODO: Assemble JavaScript into code variable.
//   return `bleSetLightAnimation('${dropdown_animation}', ${number_name}, ${text_color});\n`
// }
// javascriptGenerator.clear_light = function (block: any) {
//   return 'clearAllLight();\n'
// }
