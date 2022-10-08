//过滤器，获取当前时间并且转换格式
Vue.filter('date', time => moment(time).format('DD/MM/YY, HH:mm'))

new Vue({
  name: 'notebook',
  el: '#notebook',

  data() {
    return {
      // vue中实现本地储存的方法：localStorage，在HTML5中，新加入了一个localStorage特性，
      // 这个特性主要是用来作为本地存储来使用的，解决了cookie存储空间不足的问题
      // (cookie中每条cookie的存储空间为4k)，localStorage中一般浏览器支持的是5M大小，
      // 这个在不同的浏览器中localStorage会有所不同。
      notes: JSON.parse(localStorage.getItem('notes')) || [],
      selectedId: localStorage.getItem('selected-id') || null,
    }
  },

  // 计算属性
  computed: {
    selectedNote() {
      return this.notes.find(note => note.id === this.selectedId)
    },

    notePreview() {
      return this.selectedNote ? marked.parse(this.selectedNote.content) : ''
    },

    sortedNotes() {
      return this.notes.slice().sort((a, b) => a.created - b.created)
        .sort((a, b) => (a.favorite === b.favorite) ? 0 : a.favorite ? -1 : 1)
    },

    linesCount() {
      if (this.selectedNote) {
        // 文章的行数
        return this.selectedNote.content.split(/\r\n|\r|\n/).length
      }
    },

    wordsCount() {
      if (this.selectedNote) {
        var s = this.selectedNote.content
        // 将换行变成一个空格
        s = s.replace(/\n/g, ' ')
        // 清楚开头和结尾的空格
        s = s.replace(/(^\s*)|(\s*$)/gi, '')
        // 将两个空格及以上的转化为一个空格
        s = s.replace(/[ ]{2,}/gi, ' ')
        // 返回空格数量
        return s.split(' ').length
      }
    },

    charactersCount() {
      if (this.selectedNote) {
        return this.selectedNote.content.split('').length
      }
    },
  },

  // watch是vue内部提供的一个用于侦听功能的更通用的方法，
  // 其用来响应数据的变化，
  // 通过特定的数据变化驱动一些操作。
  // vue官方文档解释当需要在数据变化时执行异步或开销较大的操作时，推荐使用该方法。
  watch: {
    // 当文章改变时，保存文章
    // 当监听的是对象属性，手动修改对象的某个属性值是会发现，监听并没有生效，
    // 此时我们需要用到watch的deep属性，
    // 当deep为true时它会一层层遍历给对象的所有属性都加上这个监听函数，
    // 这样可以检测到对象的每个属性变化
    notes: {
      handler: 'saveNotes',
      deep: true,
    },
    // 保存这个选择
    selectedId(val, oldVal) {
      localStorage.setItem('selected-id', val)
    },
  },

  methods: {
    addNote() {
      const time = Date.now()
      // 新笔记
      const note = {
        id: String(time),
        title: 'New note ' + (this.notes.length + 1),
        content: '**Hi!** This notebook is using [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for formatting!',
        created: time,
        favorite: false,
      }
      // 添加
      this.notes.push(note)
      // 删除
      this.selectNote(note)
    },

    removeNote() {
      if (this.selectedNote && confirm('Delete the note?')) {
        const index = this.notes.indexOf(this.selectedNote)
        if (index !== -1) {
          this.notes.splice(index, 1)
        }
      }
    },

    selectNote(note) {
      // 更新计算属性
      this.selectedId = note.id
    },

    saveNotes() {
      localStorage.setItem('notes', JSON.stringify(this.notes))
      console.log('Notes saved!', new Date())
    },

    favoriteNote() {
      // this.selectedNote.favorite = !this.selectedNote.favorite
      // this.selectedNote.favorite = this.selectedNote.favorite ^ true
      this.selectedNote.favorite ^= true
    },
  },
})