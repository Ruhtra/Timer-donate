export class Messages {
        constructor(block) {
            this.block = block
            this.list = {}
        }
        template(title, message) {
            const id = (Math.random()*10**19).toString()
        
            var newDiv = document.createElement('div')
            newDiv.id = `_${id}`
            newDiv.classList.add('boxMessage')
            newDiv.innerHTML = '<div class="gridMessage">'+
                                    `<div id="title" class="up">${title}</div>`+
                                    `<div id="close" class="up"><svg fill-rule="evenodd" clip-rule="evenodd"><path d="M7 5h17v16h-17l-7-7.972 7-8.028zm7 6.586l-2.586-2.586-1.414 1.414 2.586 2.586-2.586 2.586 1.414 1.414 2.586-2.586 2.586 2.586 1.414-1.414-2.586-2.586 2.586-2.586-1.414-1.414-2.586 2.586z"/></svg></div>`+
                                    `<div id="message">${message}</div>`+
                                '</div>'
        
            return [newDiv, id]
        }
        insert(title, msg) {
            var [div, id] = this.template(title, msg)

            this.block.appendChild(div)

            this.list[id] = {
                title: title,
                message: msg,
                time: setTimeout(() => {this.close(id)}, 6000)
            }
            this.block.querySelector(`div#_${id} div#close`).addEventListener(('click'), () => {
                this.close(id)
            })
            setTimeout(() => { this.show(id) }, 0)
        }
        show(id) {
            this.block.querySelector(`div#_${id}`).style.transform = 'translateX(340px)'
        }
        close(id) {
            id = id.split('_')[1] || id
            clearTimeout(this.list[id].time)

            const item = this.block.querySelector(`div#_${id}`)

            item.style.transform = 'translateX(0px)'
            setTimeout(() => { item.style.maxHeight = 0 }, 1000);
            setTimeout(() => { item.remove() }, 2000) 
        }
    }