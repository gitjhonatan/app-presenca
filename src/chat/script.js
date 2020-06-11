'use strict'

// INFORMAÇÕES DO BOT
const idBot = 'botrouterteste1',
    keyBot = '',
    blipChatKey = ''

const search = location.search.substring(1)
const urlData = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')

const fullName = urlData.fullName
const phoneNumber = urlData.phoneNumber
const textoInicio = urlData.textoInicio
const consultor = urlData.consultor
const firebaseUID = urlData.firebaseUID
const tokenPUSH = urlData.tokenPUSH
const cpf = urlData.cpf
const email = urlData.email
const campaign = urlData.campaign

let extras = {
    firebaseUID: firebaseUID
}

if (consultor)
    extras.consultor = consultor
if (tokenPUSH)
    extras['#inbox.forwardTo'] = `${tokenPUSH}@firebase.gw.msging.net`
if (cpf)
    extras.CPF = cpf
if (campaign)
    extras.campanha = campaign

let resource = {
    identity: `${firebaseUID}.${idBot}@0mn.io`,
    name: fullName,
    extras: extras
}

if (email)
    resource.email = email
if (phoneNumber)
    resource.phoneNumber = phoneNumber

const infos = {
    id: generateGUID(),
    method: 'merge',
    uri: '/contacts',
    type: 'application/vnd.lime.contact+json',
    resource: resource
}

const blipClient = new BlipChat()
    .withTarget('chatblip')
    .withAppKey(blipChatKey)
    .withAuth({
        authType: BlipChat.DEV_AUTH,
        userIdentity: firebaseUID,
        userPassword: firebaseUID,
    }).withAccount({
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        extras: extras
    })
    .withEventHandler(BlipChat.LOAD_EVENT, function () {
        if (textoInicio)
            blipClient.sendMessage(textoInicio)
        update()
    })

blipClient.build()

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

function update() {
    let blip = new XMLHttpRequest()
    blip.open('POST', 'https://msging.net/commands')
    blip.setRequestHeader('Authorization', keyBot)
    blip.setRequestHeader('Content-Type', 'application/json')
    blip.responseType = "json"
    blip.send(JSON.stringify(infos))
}