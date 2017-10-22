const html = require('choo/html')
const rawhtml = window.require('choo/html/raw')
const css = require('csjs-inject')
const C = require('../../constants')
const fuzzy = require('fuzzy')
const sortBy = require('lodash/sortBy')

const style = css`

.autocomplete {
  position: absolute;
  top: 100%;
  left: 40px;
  width: 300px;
  max-height: 60vh;
  overflow-y: scroll;
  flex-direction: column;
  background: ${C.DARKBLUE};
  z-index: 1001;
}

.tagrow {
  position: relative;
  height: 40px;
  padding: 10px;
  justify-content: space-between;
  flex-direction: row;
  font-family: CooperHewitt-Light;
  font-size: 1.2em;
  color: ${C.LIGHTGREY};
}

.match {
  font-weight: bold;
  color: ${C.YELLOW};
}

.more {
  color: ${C.LIGHTGREY};
  font-style: italic;
  opacity: 0.5;
}

`

const matchopts = {
  pre: `<span class=${style.match}>`,
  post: '</span>'
}

module.exports = (state, emit) => {
  const tagquery = state.search.tagquery

  if (!tagquery) return null

  const tagcount = tag => {
    return {
      string: tag.string,
      original: tag.original,
      count: state.tags.tags[tag.original].length
    }
  }

  const taghits = () => {
    const alltags = Object.keys(state.tags.tags).filter(t => t !== '__local')
    if (tagquery === '#') {
      return alltags.map(tag => {
        return {
          string: tag,
          original: tag
        }
      })
    } else {
      return fuzzy.filter(tagquery, alltags, matchopts)
    }
  }

  const row = tag => {
    const row = html`

    <div class="${style.tagrow} clickable">
      ${rawhtml(`<div>#${tag.string}</div>`)}
      <div>${tag.count}</div>
    </div>

    `

    row.onclick = e => {
      e.preventDefault()
      emit('search:add-tag', tag.original)
    }

    return row
  }

  const rows = () => {
    const hits = taghits().map(tagcount)
    const sorted = sortBy(hits, tag => { return 0 - tag.count })
    return sorted.map(row)
  }

  return html`

  <div class="${style.autocomplete}">
    ${rows()}
  </div>

  `
}
