const socket = io()  //connect to the server

//================================================Elements=============================================

const $messageForm = document.querySelector('#message-form')  //$ -> convention for DOM
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location') 
const $messages = document.querySelector('#messages')

//=====================================================================================================

//=============================================Templates===============================================

const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationMessageTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

//=====================================================================================================


//======================================Options========================================================

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) 
//=====================================================================================================


//autoscrolling
const autoscroll = () => {
    //get the new message
    const $newMessage = $messages.lastElementChild //gives last element in the messages div

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage) 
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
                                                            
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //height of message + margin

    //visible Height
    const visibleHeight = $messages.offsetHeight //height of the container

    const containerHeight = $messages.scrollHeight  // height of the total messages on the page from top to bottom

    //how much scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight// distance from top + visible screen

    if(containerHeight - newMessageHeight <= scrollOffset) { 
        //autoscroll
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {                                              
        username:message.username,
        message:message.text,                         
        createdAt:moment(message.createdAt).format('h:mm a')       
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        username: location.username,
        url:location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html  
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() 
    //disable form
    $messageFormButton.setAttribute('disabled', 'disabled') 
    const message = e.target.elements.message.value  
    socket.emit('sendMessage', message, (error) => {   
        //enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''  
        $messageFormInput.focus()       
        if(error) {
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$locationButton.addEventListener('click', (e) => {
    if(!navigator.geolocation) { 
        return alert('Geolocation is not Supported by your browser')
    } 

    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => { 
        socket.emit('sendLocation', 
        {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })  
})

socket.emit('join', {username, room }, (error) => { 
    if(error) {
        alert(error)
        location.href = '/' //redirect to join page
    }
    console.log('User joined')
})  