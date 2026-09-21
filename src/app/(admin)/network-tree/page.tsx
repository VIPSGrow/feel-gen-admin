import TreeConnector from '@/components/admin/GenologyTree/TreeConnector';
import TreeCompo from '@/components/admin/tree/TreeCompo';
import { Metadata } from 'next';
import React from 'react';


export const metadata: Metadata = {
  title: "Network Tree | Feel Safe Admin",
  description: "Binary genealogy tree viewer for MLM network",
};



const NetworkTreePage = () => {
  

  

  return (
    <>
    {/* <TreeCompo /> */}
    <TreeConnector />
    </>
  );
};

export default NetworkTreePage;

