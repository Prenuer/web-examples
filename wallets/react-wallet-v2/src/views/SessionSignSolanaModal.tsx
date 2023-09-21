import ModalFooter from '@/components/ModalFooter'
import ProjectInfoCard from '@/components/ProjectInfoCard'
import RequestDataCard from '@/components/RequestDataCard'
import RequesDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import RequestModalContainer from '@/components/RequestModalContainer'
import VerifyInfobox from '@/components/VerifyInfobox'
import ModalStore from '@/store/ModalStore'
import { styledToast } from '@/utils/HelperUtil'
import { approveSolanaRequest, rejectSolanaRequest } from '@/utils/SolanaRequestHandlerUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { Button, Divider, Modal, Text } from '@nextui-org/react'
import { Fragment } from 'react'

export default function SessionSignSolanaModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { request, chainId } = params

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveSolanaRequest(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        styledToast((e as Error).message, 'error')
        return
      }
      ModalStore.close()
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectSolanaRequest(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        styledToast((e as Error).message, 'error')
        return
      }
      ModalStore.close()
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="">
        <ProjectInfoCard
          metadata={requestSession.peer.metadata}
          intention="sign a Solana message"
        />

        <Divider y={1} />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider y={1} />

        <RequestDataCard data={params} />

        <Divider y={1} />

        <RequestMethodCard methods={[request.method]} />
        <VerifyInfobox metadata={requestSession.peer.metadata} />
      </RequestModalContainer>
      <ModalFooter onApprove={onApprove} onReject={onReject} />
    </Fragment>
  )
}
