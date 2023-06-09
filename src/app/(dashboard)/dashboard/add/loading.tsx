import { FunctionComponent } from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

interface LoadingProps {
    
}
 
const Loading: FunctionComponent<LoadingProps> = () => {
    return ( 
        <div className="w-full mt-10 flex-col gap-3 ">
            <Skeleton className="mb-4" height={60} width={300}/>
            <Skeleton height={20} width={150}/>
            <Skeleton height={50} width={400}/>
        </div>
     );
}
 
export default Loading;