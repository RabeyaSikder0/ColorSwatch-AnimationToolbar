import React from 'react'
import SampleListView from './list/SampleListView';
import {DEMOS} from '../models/demo';

const HomeScreen: React.FC=() => {
  return (
    <SampleListView 
        title="Animation Samples"
        backEnabled={false}
        listData={DEMOS}
    />
  )
}

export default HomeScreen
