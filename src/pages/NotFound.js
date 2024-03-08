import Link from '../components/Link';

const NotFound = ({}) => {

  return (
    <div className='center' style={{flex:1, width:'100%'}}>
      <div style={{maxWidth:400}}>
        <p>
          <span style={{fontWeight:'bold'}}>Oops! We couldn't find the page in this universe.</span>
        </p>
        <p>
          <Link path="/main">Take Me Somewhere Known</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;