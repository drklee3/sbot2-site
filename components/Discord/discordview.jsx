import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import Embed from './embed'
import { parse, parseAllowLinks, jumboify } from './markdown'


class MessageTimestamp extends React.Component {
  componentDidMount() {
    this.timer = setInterval(() => this.tick(), 1000 * 60)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  tick() {
    this.forceUpdate()
  }

  render() {
    const computed = Moment().calendar()

    return <span className='timestamp'>{computed}</span>
  }
}

class MessageBody extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    image: PropTypes.string,
    isBot: PropTypes.bool,
  }

  render() {
    const { content, image, isBot } = this.props

    if (content || image) {
      if (isBot) {
        return <div className='markup'>{ parseAllowLinks(content, true, {}, jumboify) }</div>
      }

      return (
        <div>
          { image && <img src={ image } alt={ image } style={{ marginTop: '15px', width: '100%', maxWidth: '400px' }} /> }
          { content && <div className='markup'>{ parse(content, true, {}, jumboify) }</div> }
        </div>
      )      
    }

    return null
  }

}

class CozyMessageHeader extends React.Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    isBot: PropTypes.bool,
  }

  render() {
    const { username, isBot } = this.props

    return (
      <h2 style={{ lineHeight: '16px' }}>
        <span className='username-wrapper v-btm'>
          <strong className='user-name'>{username}</strong>
          {isBot && <span className='bot-tag'>BOT</span>}
        </span>
        <span className='highlight-separator'> - </span>
        <MessageTimestamp />
      </h2>
    )
  }
}


class Avatar extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
  }

  render() {
    return <div className='avatar-large animate' style={{ backgroundImage: `url('${this.props.url}')` }} />
  }
}

class DiscordViewWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }
  render() {
    // yikes
    // we could actually just flatten the styling out on the respective elements,
    // but copying directly from discord is a lot easier than that
    return (
      <div className='w-100 h-100 overflow-auto pa2 discord-view'>
        <div className='flex-vertical whitney theme-dark'>
          <div className='chat flex-vertical flex-spacer'>
            <div className='content flex-spacer flex-horizontal'>
              <div className='flex-spacer flex-vertical messages-wrapper'>
                <div className='scroller-wrap'>
                  <div className='scroller messages'>
                    {this.props.children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class DiscordMessage extends React.Component {
  static propTypes = {
    msg: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    isBot: PropTypes.bool,
  }

  render() {
    const { msg, username, avatar, isBot } = this.props
    let defaultAvatar

    if (!avatar) {
      const rand = Math.floor(Math.random() * (4 - 0 + 1)) + 0
      // this just prevents Warning: Prop `style` did not match.
      // const fake_rand = msg.content.length % 4
      defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${ rand }.png`
    }

    return (
      <div className='message-group hide-overflow'>
        <Avatar url={ avatar ? avatar : defaultAvatar } />
        <div className='comment'>
          <div className='discord-message first'>
            <CozyMessageHeader username={ username } isBot={ isBot } />
            <div className='message-text'>
              <MessageBody
                content={ msg.content }
                username={ username }
                image={ msg.image }
              />
            </div>
            { msg.embed && <Embed { ...msg.embed } /> }
          </div>
        </div>
      </div>
    )
  }
}

class DiscordView extends React.Component {
  static propTypes = {
    messages: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    botUsername: PropTypes.string.isRequired,
    botAvatarUrl: PropTypes.string.isRequired,
  }

  render() {
    const { messages, username, avatar, botUsername, botAvatarUrl } = this.props

    return (
      <div className='w-100 h-100 br2 flex flex-column white overflow-hidden'>
        <DiscordViewWrapper >
          <DiscordMessage msg={messages.command} username={username} avatar={avatar} />
          <DiscordMessage msg={messages.response} username={botUsername} avatar={botAvatarUrl} isBot={true} />
        </DiscordViewWrapper>
      </div>
    )
  }
}

class DiscordInput extends React.Component {
  static propTypes = {
    input: PropTypes.string,
  }

  render() {
    return (
      <form className='discord-form'>
        <textarea
          value={ this.props.input }
          className='discord-text-area'
          rows="1"
          placeholder="Message #general"
          spellCheck="false"/>
      </form>
    )
  }
}

class DiscordMessages extends React.Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    input: PropTypes.string,
  }
  
  constructor(props) {
    super(props)

    this.el = React.createRef()
  }

  componentDidUpdate(prevProps) {
    // only scroll when messages update, not typing
    if (prevProps.messages.length !== this.props.messages.length) {
      this.el.current.scrollTop = this.el.current.scrollHeight
    }
  }

  render() {
    return (
      <DiscordViewWrapper>
        <div className='discord-scroll' ref={ this.el }>
          {
            this.props.messages.map((msg, i) => (
              <DiscordMessage key={i} msg={msg.data} username={msg.username} avatar={msg.avatar} isBot={msg.isBot} />
            ))
          }
        </div>
        <DiscordInput input={ this.props.input }/>
      </DiscordViewWrapper>
    )
  }
}


export { DiscordView, DiscordMessages }
