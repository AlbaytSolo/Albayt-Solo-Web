"use client"
import Image from 'next/image'
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import PaketAlbayt from '@/Components/PaketAlbayt';
import OrderButton from '@/app/paket/[title]/OrderButton';
import Seatbar_Alt from '@/Components/Seatbar_Alt';
import LoadingBar from '@/Components/LoadingBar';
import { FASILITAS_PAKET, TESTIMONI } from '@/constants';
import {HargaProps, HotelProps, PackageProps} from "@/Components/Card_Paket";

export default function Paket() {
    const params = useParams();
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const [paketData, setPaketData] = useState<PackageProps>();
    const boxPemesananMobileRef = useRef<HTMLDivElement>(null);
    const [boxPemesananVisible, setBoxPemesananVisible] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isLoading, setLoading ] = useState<boolean>(true)
    const [exchangeRate, setExchangeRate] = useState(null);

    useEffect(() => {
      const data_paket = sessionStorage.getItem('paket');
      if (data_paket) {
        const parsedData = JSON.parse(data_paket);
        const currentPaket = parsedData.find((paket: PackageProps) => paket.paketID === params.title)
        setPaketData(currentPaket);
        setLoading(false);
      } else {

      }

      const fetchData = async () => {
        try {
          const response = await fetch(`/api/paket/${params.title}`);
          if (!response.ok) {
            console.log('Failed to fetch paketData');
          }
          const paketData = await response.json();
          setPaketData(paketData);
        } catch (Error) {
          console.error('Error fetching paketData:', Error);
        } finally {
          setLoading(false);
        }
      };
      // fetchData().then();//
    }, []);

    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setBoxPemesananVisible(true);
          } else {
            setBoxPemesananVisible(false);
          }
        });
      });
      const boxPemesananMobile = boxPemesananMobileRef?.current;
      if (boxPemesananMobile) {
        observer.observe(boxPemesananMobile);
      }

      return () => {
        if (boxPemesananMobile) {
          observer.unobserve(boxPemesananMobile);
        }
      };
    }, [boxPemesananMobileRef]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.IDR);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };

    fetchExchangeRate().then();
  }, []);

    const currentPage = paketData;
    const hargaArr = currentPage?.harga

  const boxPemesanan = () => {
      return (
          <div>
            <div className="bg-white border-[rgba(0,0,0,0.16)] shadow-2xl flex flex-col justify-center items-center rounded-2xl w-[100%] h-fit p-10">
              <h1 className='font-bold text-center text-lg mb-5'>{currentPage?.title}</h1>
              <Seatbar_Alt totalSeat={currentPage?.totalseat || 0 } remainingSeat={currentPage?.remainingseat || 0 }></Seatbar_Alt>
              <div className='border-gray-20 rounded-2xl px-4 my-3 w-full bg-slate-100 mb-6'>
                <div className='flex items-center my-2'>
                  <div className='w-full text-2xl font-bold text-yellow-600 text-center'>
                    <p>DP </p>
                    <p>{currentPage?.harga_dp?.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}</p>
                  </div>
                </div>
                <div>
                  {hargaArr?.map((item: HargaProps, index) => (
                      <div key={index} className={"mt-2 mb-2"}>
                        <div className='flexBetween'>
                          {item.currency?.toLowerCase() === 'idr' && (
                              <p className='font-bold text-[#f14310]'>
                                {item.nominal.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}
                              </p>
                          )}
                          {item.currency?.toLowerCase() === 'usd' && (
                              <p className='font-bold text-[#f14310]'>
                                {item.nominal.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                              </p>
                          )}
                          <p className='font-medium text-[#f14310]'>{item.tipe}</p>
                        </div>
                        <div>
                          {item.currency === 'usd' && exchangeRate && (
                              <p className='font-bold text-[12px] text-green-50'>
                                {(item.nominal * exchangeRate).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (*kurs saat ini)
                              </p>
                          )}
                        </div>
                      </div>


                  ))}
                </div>
              </div>
              <div className="mt-4 h-1 w-[60%] rounded opacity-40 bg-slate-950"></div>
              <Link href={`https://wa.me/628122586045?text=Assalammu'alaikum Al-Bayt Solo. Saya ingin mengetahui lebih lanjut paket dari website  yaitu paket ${currentPage?.title}. Apakah bisa dijelaskan lebih lanjut ?`} className='w-full' target='_blank' rel="noopener noreferrer">
                <div
                    className="flex items-center bg-[#208942] text-gray font-semibold py-2 px-4 rounded justify-center space-x-4 text-zinc-50 w-full mt-3 duration-200 hover:bg-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                       className="bi bi-whatsapp" viewBox="0 0 16 16">
                    <path
                        d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  <p>Tanya CS</p>
                </div>
              </Link>
              {/* <Link href={'/orderpage'} className='w-full'>
                      <div className="bg-[#89060b] flex space-x-4 text-gray font-semibold py-2 px-4 rounded  justify-center text-center text-zinc-50 w-full mt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-airplane" viewBox="0 0 16 16">
                          <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849m.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1s-.458.158-.678.599"/>
                        </svg>
                        <p>Pesan Sekarang</p>
                      </div>
                    </Link> */}
              <div className={'w-full'}>
                <OrderButton></OrderButton>
              </div>

            </div>
            <div className='px-5 py-2 w-full'>
              <p className='mb-2 text-gray-50 text-end'>Bagikan</p>
              <div className='flex flex-col gap-5 items-end'>
                <ul className='regular-14 flex gap-4 text-gray-30'>
                  <Link href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}>
                    <Image src={"/facebook.svg"} alt='logo' width={24} height={24}/>
                  </Link>
                  <Link href={""}>
                    <Image src={"/instagram.svg"} alt='logo' width={24} height={24}/>
                  </Link>
                  <Link href={""}>
                    <Image src={"/whatsapp.svg"} alt='logo' width={24} height={24}/>
                  </Link>
                </ul>
              </div>
            </div>
          </div>
      )
  }

  return (
    <section>
      {isLoading ? (<LoadingBar />) : (
          <div>
            {!boxPemesananVisible && isScrolled &&
                <div className={'fixed h-full w-full z-50 flex md:hidden items-end'}>
                  <div className={'mb-20 w-full flex h-20 justify-center items-center'}>
                    <div className='w-1/2 h-full mt-6 space-x-4'>
                      <div
                          className="flex bg-[#208942] text-gray font-semibold py-2 px-4 rounded items-center justify-center space-x-4 text-zinc-50 h-full w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                             className="bi bi-whatsapp" viewBox="0 0 16 16">
                          <path
                              d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                        </svg>
                        <p>Tanya CS</p>
                      </div>
                    </div>
                    <div className={'w-1/2 h-full'}>
                      <OrderButton></OrderButton>
                    </div>
                  </div>
                </div>
            }

            <div className="mt-4 w-full h-[55vh] bg-white bg-fixed mx-auto px-4 bg-cover"
                 style={{backgroundImage: "url('/images/background1.jpg')"}}>
              <div className="h-[55vh] flex justify-start items-center sm:p-2 md:p-10">
                <h1 className="mb-4 text-gray-100 text-2xl md:text-4xl lg:text-6xl font-extrabold ">
              <span style={{
                backgroundImage: "linear-gradient(90deg, white, #f14310)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                  {currentPage?.title}
              </span>
                </h1>
              </div>
            </div>

            <div
                className="sm:px-2 xl:px-36 w-screen bg-gradient-to-t to-transparent from-[#ffc750] flex justify-center items-center pb-16 ">
              <div className="flex pt-4">
                <div className="bg-transparent sm:w-full md:w-[60%] xl:w-[70%] sm:px-2 sm:py-10 xl:p-10">
                  <div className="rounded-2xl justify-center items-center p-5">
                    <p className='mb-8 text-gray-700'>
                      <Link href={"/"}>Beranda </Link>
                      <span>&gt;</span>
                      <Link href={"/paketpage"}> Paket Umroh </Link>
                      <span className='mr-1'>&gt;</span>
                      <span className='font-semibold'>{currentPage?.title}</span>
                    </p>
                    <img alt="poster" className="block object-cover w-100% rounded-2xl" src={currentPage?.img}>
                    </img>
                    <div className="mt-5 gap-4 grid grid-cols-2 xl:grid-cols-3 h-fit text-center text-gray">
                      <div className="border rounded-3xl p-4 flex flex-col items-center justify-center h-36 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             style={{fill: "#f14310"}}>
                          <path
                              d="M21 20V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm2-5H5V7h14v2z"></path>
                        </svg>
                        <div className='text-[14px] lg:text-lg'>Tanggal Keberangkatan</div>
                        <div className="text-[16px] lg:text-lg font-semibold mt-2">{currentPage?.jadwal}</div>
                      </div>
                      <div className="border rounded-3xl p-4 flex flex-col items-center justify-center h-36 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             style={{fill: '#f14310'}}>
                          <path
                              d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zM9.799 14.987H8v-1.799l4.977-4.97 1.799 1.799-4.977 4.97zm5.824-5.817-1.799-1.799L15.196 6l1.799 1.799-1.372 1.371z"></path>
                        </svg>
                        <div className='text-[14px] lg:text-lg' >Lokasi Keberangkatan</div>
                        <div className="text-[16px] lg:text-lg font-semibold mt-2">{currentPage?.lokasiberangkat}</div>
                      </div>
                      <div className="border rounded-3xl p-4 flex flex-col items-center justify-center h-36 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             style={{fill: '#f14310'}}>
                          <path
                              d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                          <path d="M13 7h-2v6h6v-2h-4z"></path>
                        </svg>
                        <div className='text-[14px] lg:text-lg'>Durasi Perjalanan</div>
                        <div className="text-[16px] lg:text-lg font-semibold mt-2">{currentPage?.durasi} hari</div>
                      </div>
                      <div className="border rounded-3xl p-4 flex flex-col items-center justify-center h-36 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             style={{fill: "#f14310"}}>
                          <path
                              d="M3.414 13.778 2 15.192l4.949 2.121 2.122 4.95 1.414-1.414-.707-3.536L13.091 14l3.61 7.704 1.339-1.339-1.19-10.123 2.828-2.829a2 2 0 1 0-2.828-2.828l-2.903 2.903L3.824 6.297 2.559 7.563l7.644 3.67-3.253 3.253-3.536-.708z"></path>
                        </svg>
                        <div className='text-[14px] lg:text-lg'>Maskapai</div>
                        <div className="text-[16px] lg:text-lg font-semibold mt-2">{currentPage?.maskapai}</div>
                      </div>
                      <div className="border rounded-3xl p-4 flex flex-col items-center justify-center h-36 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             style={{fill: "#f14310"}}>
                          <path
                              d="M18 2H6c-1.103 0-2 .897-2 2v17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm0 18H6V4h12v16z"></path>
                          <path
                              d="M8 6h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 .031h3V12h-3zM8 14h3v2H8zm5 0h3v2h-3z"></path>
                        </svg>
                        <div className='text-[14px] lg:text-lg'>Hotel</div>
                        <div className="text-2xl flex font-semibold mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                               style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                          {/*{currentPage?.hotel}*/}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate w-full md:hidden p-2 relative">
                    <div>
                      {boxPemesanan()}
                      <div
                          className="z-50 absolute left-1/2 top-3/4 transform -translate-x-1/2 -translate-y-1/2"
                          ref={boxPemesananMobileRef}>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded border-[rgba(0,0,0,0.16)] min-h-48 mt-4 shadow justify-center bg-white p-6">

                    <h3 className='font-bold text-2xl lg:text-3xl text-[#f14310] mb-4'>Fasilitas</h3>
                    <p className='block bg-[#f14310] w-[20%] h-[3px] mb-6'></p>

                    {FASILITAS_PAKET.map((fasilitas) => (
                      <div key={fasilitas.id_fasilitas} className='mb-8'>
                        <p className="text-[#f14310] font-bold text-lg lg:text-2xl mb-3">
                          {fasilitas.title}
                        </p>
                        <ul className="pl-5 list-disc">
                          {fasilitas.contents.map((ket_fasilitas) => (
                            <li className='font-medium my-2 text-gray-700 text-[14px] lg:text-[16px]' key={ket_fasilitas.label}>{ket_fasilitas.value}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div
                      className="border rounded border-[rgba(0,0,0,0.16)] min-h-48 mt-4 shadow justify-center bg-white p-6">
                    <p className="text-[#f14310] font-bold text-2xl mb-4">
                      Hotel
                    </p>
                    <p className='block bg-[#f14310] w-[20%] h-[3px] mb-6'></p>
                    {/*<p className='font-bold mb-2'>Hotel Lorem Ipsum</p>*/}
                    {/*<div className='flex mb-4'>*/}
                      {/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"*/}
                      {/*     style={{fill: '#f14310'}}>*/}
                      {/*  <path*/}
                      {/*      d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zM9.799 14.987H8v-1.799l4.977-4.97 1.799 1.799-4.977 4.97zm5.824-5.817-1.799-1.799L15.196 6l1.799 1.799-1.372 1.371z"></path>*/}
                      {/*</svg>*/}
                      {/*<p>200m dari lorem ipsum</p>*/}
                    {/*</div>*/}

                    <div className='w-full'>
                      {currentPage?.hotel?.map((item: HotelProps, index: number) => (
                          <div key={index} className='my-3'>
                            <p className='font-bold mb-2'>{item.nama_hotel}</p>
                            <div className='grid lg:grid-cols-3 grid-cols-1 gap-4'>
                              {item.url_hotel?.map((imageUrl: string, i) => (
                                  <img key={i} className='w-full lg:h-32 h-40 object-cover' alt={`hotel ${index}`}
                                       src={imageUrl}></img>
                              ))}
                            </div>
                          </div>
                      ))}
                    </div>

                  </div>
                  <div
                      className="border rounded border-[rgba(0,0,0,0.16)] min-h-48 mt-4 shadow justify-center bg-white p-6">
                    <p className="text-[#f14310] font-bold text-2xl mb-4">
                      Testimoni
                    </p>
                    <p className='block bg-[#f14310] w-[20%] h-[3px] mb-6'></p>
                    {TESTIMONI.map((testi) => (

                    
                      <div key={testi.key} className='border-b-2 pb-10 pl-4 mt-4'>
                        <p className='text-lg'>{testi.nama}</p>
                        <div className='flex mb-4'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              style={{fill: 'gold', transform: '', msFilter: ''}}>
                            <path
                                d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"/>
                          </svg>
                        </div>
                        <p>{testi.review}</p>
                      </div> 

                    ))} 
                  </div>
                </div>
                <div className="text-slate h-vh md:w-[40%] xl:w-[30%] hidden pt-10 md:block ">
                  <div className='sticky top-24 z-1000'>
                    {boxPemesanan()}
                  </div>
                </div>
              </div>
            </div>
            <div className=''>
              <PaketAlbayt/>
            </div>
          </div>
      )
      }
    </section>
  );
}
  
