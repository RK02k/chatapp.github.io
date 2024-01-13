 // io()
const socket = io()

const $messageform = document.querySelector('#message_form')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $location = document.querySelector('#send_loca')
const $message = document.querySelector('#message')

// Templates
const messtemp = document.querySelector('#message-temp').innerHTML
const locamess = document.querySelector('#message-location').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options for to enter in the chat like username and room
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix :true})


const autoscroll = () => {
  // New message element
  const $newMessage = $message.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $message.offsetHeight

  // Height of messages container
  const containerHeight = $message.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $message.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      $message.scrollTop = $message.scrollHeight
  }
}

// const $location_but = $location.querySelector('click')
// socket.on('countupdated',(count) =>{
//     console.log('the count has been updated',count)
// })

// document.querySelector("#incr").addEventListener('click',() => { // id :- #incr
//   console.log('clicked')
//   socket.emit('increment') // it transfer the data to server
// })

// socket.on('Message',(con)=> it was previously used thing
// {
//   console.log(con)
//  // socket.emit('well')
// })

socket.on('Message',(con)=>
{
 console.log(con);
  const html = Mustache.render(messtemp, {username: con.username,message: con.text,createdAt : moment(con.createdAt).format('h:mm a')}); // Pass the data object
  $message.insertAdjacentHTML('beforeend', html);
})

$messageform.addEventListener('submit',(e) =>{
  e.preventDefault() // it default refresh the page

  $messageformbutton.setAttribute('disabled','disabled')
  // const message = document.querySelector('input').value
  const message = e.target.elements.goway.value
  // socket.emit('sendMessage',message)
  socket.emit('sendMessage',message,(error) =>{
    $messageformbutton.removeAttribute('disabled') // enable 
    $messageforminput.value = ''
    $messageforminput.focus()
    if(error)
    {
      return console.log(error)
    }
    console.log('Message was delivered !')
    autoscroll()
  })
  // socket.emit('sendMessage',message,(message) =>{
  //   console.log('Message was delivered !',message)
  // })
})


$location.addEventListener('click',(e) =>
{
  if(!navigator.geolocation)
  {
    return alert('Geolocation is not supported by your browser')
  }
  $location.setAttribute('disabled','disabled')
  navigator.geolocation.getCurrentPosition((position) =>
  {
    //  console.log(position)
    //
    socket.emit('sendlocation',{
      latitude :position.coords.latitude,
      longitude : position.coords.longitude
    },() =>{
      $location.removeAttribute('disabled')
      console.log('location is shared!')
    })
  })
})


socket.on('locationMessage',(url)=>{
  console.log(url)
  // const html = Mustache.render(locamess,{
  //   url : url
  // })
  const html = Mustache.render(locamess,{
    username: message.username,
    url : url.url,
    createdAt : moment(url.createdAt).format('h:mm a')
  })
  $message.insertAdjacentHTML('beforeend', html)
})


// socket.emit('join',{username,room})
socket.emit('join', { username, room }, (error) => {
  if (error) {
      alert(error)
      location.href = '/'
  }
})

// socket.emit('roomData',({room,users})=>{
//   console.log(room)
//   console.log(users)
// })

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
      room,
      users
  })
  document.querySelector('#sidebar').innerHTML = html
})


