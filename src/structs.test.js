/* eslint-env mocha */
const assert = require('assert')
const Fcbuffer = require('fcbuffer')

const Eos = require('..')

describe('shorthand', () => {

  it('Asset', () => {
    const eos = Eos.Testnet()
    const {Asset} = eos.structs
    const obj = Asset.fromObject('1 EOS')
    assert.deepEqual(obj, {amount: '1', symbol: 'EOS'})

    const obj2 = Asset.fromObject({amount: 1, symbol: 'EOS'})
    assert.deepEqual(obj2, {amount: '1', symbol: 'EOS'})
  })

  it('Authority', () => {
    const eos = Eos.Testnet()
    const {Authority} = eos.structs

    const pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    const auth = {threshold: 1, keys: [{key: pubkey, weight: 1}], accounts: []}

    assert.deepEqual(Authority.fromObject(pubkey), auth)
    assert.deepEqual(Authority.fromObject(auth), auth)
  })

  it('PublicKey', () => {
    const eos = Eos.Testnet()
    const {structs, types} = eos
    const PublicKeyType = types.PublicKey()
    const pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    // 02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf
    assertSerializer(PublicKeyType, pubkey)
  })

})

describe('Message.data', () => {
  it('json', () => {
    const eos = Eos.Testnet({forceMessageDataHex: false})
    const {structs, types} = eos
    const value = {
      code: 'eos',
      type: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        amount: '1',
        memo: ''
      },
      authorization: []
    }
    assertSerializer(structs.Message, value)
  })

  it('hex', () => {
    const eos = Eos.Testnet({forceMessageDataHex: false, debug: false})
    const {structs, types} = eos

    const tr = {from: 'inita', to: 'initb', amount: '1', memo: ''}
    const hex = Fcbuffer.toBuffer(structs.transfer, tr).toString('hex')
    // const lenPrefixHex = Number(hex.length / 2).toString(16) + hex.toString('hex')

    const value = {
      code: 'eos',
      type: 'transfer',
      data: hex,
      authorization: []
    }
    
    const type = structs.Message
    const obj = type.fromObject(value) // tests fromObject
    const buf = Fcbuffer.toBuffer(type, obj) // tests appendByteBuffer
    const obj2 = Fcbuffer.fromBuffer(type, buf) // tests fromByteBuffer
    const obj3 = type.toObject(obj) // tests toObject

    assert.deepEqual(Object.assign({}, value, {data: tr}), obj3, 'serialize object')
    assert.deepEqual(obj3, obj2, 'serialize buffer')
  })

  it('force hex', () => {
    const eos = Eos.Testnet({forceMessageDataHex: true})
    const {structs, types} = eos
    const value = {
      code: 'eos',
      type: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        amount: '1',
        memo: ''
      },
      authorization: []
    }
    const type = structs.Message
    const obj = type.fromObject(value) // tests fromObject
    const buf = Fcbuffer.toBuffer(type, obj) // tests appendByteBuffer
    const obj2 = Fcbuffer.fromBuffer(type, buf) // tests fromByteBuffer
    const obj3 = type.toObject(obj) // tests toObject

    const data = Fcbuffer.toBuffer(structs.transfer, value.data)
    const dataHex = //Number(data.length).toString(16) + 
      data.toString('hex')

    assert.deepEqual(Object.assign({}, value, {data: dataHex}), obj3, 'serialize object')
    assert.deepEqual(obj3, obj2, 'serialize buffer')
  })

  it('unknown type', () => {
    const eos = Eos.Testnet({forceMessageDataHex: false})
    const {structs, types} = eos
    const value = {
      code: 'eos',
      type: 'mytype',
      data: '030a0b0c',
      authorization: []
    }
    assertSerializer(structs.Message, value)
  })
})

function assertSerializer (type, value) {
  const obj = type.fromObject(value) // tests fromObject
  const buf = Fcbuffer.toBuffer(type, obj) // tests appendByteBuffer
  const obj2 = Fcbuffer.fromBuffer(type, buf) // tests fromByteBuffer
  const obj3 = type.toObject(obj) // tests toObject

  assert.deepEqual(value, obj3, 'serialize object')
  assert.deepEqual(obj3, obj2, 'serialize buffer')
}
