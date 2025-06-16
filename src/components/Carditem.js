import React from 'react'

function Carditem(props) {
  const { image, id, isFlipped,cardback, handleClick } = props

  return (
    <div>
      <div className={`card  ${isFlipped ? 'flipped' : ''}`}  onClick={()=> handleClick(id)}>
        <div className="card-inner">
          <div className="front" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${image})` }}>
              {/* card front side */}
          </div>
          <div className="back" style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/images/BACK${cardback}.jpg')` }}>
              {/* card back side */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Carditem

