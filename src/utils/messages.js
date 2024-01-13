const gene = (username,text) =>{
  return{
    username,
    text,
        createdAt: new Date().getTime()
  }
}


const geneM = (username,url) =>{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    gene,
    geneM
}